import {
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as config from 'config';
import { existsSync, unlinkSync } from 'fs';
import { SignOptions } from 'jsonwebtoken';
import { User, UserStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  RateLimiterRes,
  RateLimiterStoreAbstract
} from 'rate-limiter-flexible';

import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { NotFoundException } from 'src/common/exception/not-found.exception';
import { UnauthorizedException } from 'src/common/exception/unauthorized.exception';
import { CustomHttpException } from 'src/common/exception/custom-http.exception';
import { MailJobInterface } from 'src/modules/mail/interface/mail-job.interface';
import { MailService } from 'src/modules/mail/mail.service';
import { Pagination } from 'src/shared/paginate';
import { RefreshToken } from '@prisma/client';
import { RefreshTokenService } from 'src/modules/refresh-token/refresh-token.service';
import { ChangePasswordDto } from 'src/modules/auth/dto/change-password.dto';
import { ForgetPasswordDto } from 'src/modules/auth/dto/forget-password.dto';
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';
import { UserLoginDto } from 'src/modules/auth/dto/user-login.dto';
import { UserSearchFilterDto } from 'src/modules/auth/dto/user-search-filter.dto';
import { UserWithRole } from 'src/modules/auth/models/user.model';
import { UserSerializer } from 'src/modules/auth/serializer/user.serializer';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ValidationPayloadInterface } from 'src/common/interfaces/validation-error.interface';
import { RefreshPaginateFilterDto } from 'src/modules/refresh-token/dto/refresh-paginate-filter.dto';
import { RefreshTokenSerializer } from 'src/modules/refresh-token/serializer/refresh-token.serializer';

const throttleConfig = config.get('throttle.login');
const jwtConfig = config.get('jwt');
const appConfig = config.get('app');
// const isSameSite = process.env.IS_SAME_SITE || appConfig.sameSite;
// for heroku
const isSameSite =
  appConfig.sameSite !== null
    ? appConfig.sameSite
    : process.env.IS_SAME_SITE === 'true';
const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mailService: MailService,
    private readonly refreshTokenService: RefreshTokenService,
    @Inject('LOGIN_THROTTLE')
    private readonly rateLimiter: RateLimiterStoreAbstract
  ) {}

  /**
   * send mail
   * @param user
   * @param subject
   * @param url
   * @param slug
   * @param linkLabel
   */
  async sendMailToUser(
    user: UserSerializer,
    subject: string,
    url: string,
    slug: string,
    linkLabel: string
  ) {
    const appConfig = config.get('app');
    const mailData: MailJobInterface = {
      to: user.email,
      subject,
      slug,
      context: {
        email: user.email,
        link: `<a href="${appConfig.frontendUrl}/${url}">${linkLabel} →</a>`,
        username: user.username,
        subject
      }
    };
    await this.mailService.sendMail(mailData, 'system-mail');
  }

  /**
   * add new user
   * @param createUserDto
   */
  async create(createUserDto: Prisma.UserCreateInput): Promise<UserSerializer> {
    const token = await this.generateUniqueToken(12);

    if (!createUserDto.status) {
      createUserDto.status = UserStatus.INACTIVE;
      createUserDto.role = { connect: { id: 2 } }; // Connect to user role
      const currentDateTime = new Date();
      currentDateTime.setHours(currentDateTime.getHours() + 1);
      createUserDto.tokenValidityDate = currentDateTime;
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    createUserDto.salt = salt;
    createUserDto.password = hashedPassword;
    createUserDto.token = token;

    const registerProcess = createUserDto.status === UserStatus.INACTIVE;
    const user = await this.prisma.user.create({ data: createUserDto });

    // Convert to UserSerializer for email
    const userSerializer = this.transformUser(user);

    const subject = registerProcess ? 'Account created' : 'Set Password';
    const link = registerProcess ? `verify/${token}` : `reset/${token}`;
    const slug = registerProcess ? 'activate-account' : 'new-user-set-password';
    const linkLabel = registerProcess ? 'Activate Account' : 'Set Password';
    await this.sendMailToUser(userSerializer, subject, link, slug, linkLabel);
    return userSerializer;
  }

  /**
   * find user entity by condition
   * @param field
   * @param value
   */
  async findBy(field: string, value: string): Promise<UserSerializer> {
    let user: UserWithRole | null = null;

    if (field === 'email') {
      user = await this.prisma.user.findUnique({
        where: { email: value },
        include: { role: true }
      });
    } else if (field === 'username') {
      user = await this.prisma.user.findUnique({
        where: { username: value },
        include: { role: true }
      });
    } else if (field === 'id') {
      user = await this.prisma.user.findUnique({
        where: { id: parseInt(value) },
        include: { role: true }
      });
    }

    if (!user) {
      throw new NotFoundException(
        ExceptionTitleList.NotFound,
        StatusCodesList.NotFound
      );
    }

    return this.transformUser(user);
  }

  /**
   * Login user by username and password
   * @param userLoginDto
   * @param refreshTokenPayload
   */
  async login(
    userLoginDto: UserLoginDto,
    refreshTokenPayload: Partial<RefreshToken>
  ): Promise<string[]> {
    const usernameIPkey = `${userLoginDto.username}_${refreshTokenPayload.ip}`;
    const resUsernameAndIP = await this.rateLimiter.get(usernameIPkey);
    let retrySecs = 0;

    // Check if user is already blocked
    if (
      resUsernameAndIP !== null &&
      resUsernameAndIP.consumedPoints > throttleConfig.limit
    ) {
      retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      throw new CustomHttpException(
        `tooManyRequest-{"second":"${String(retrySecs)}"}`,
        HttpStatus.TOO_MANY_REQUESTS,
        StatusCodesList.TooManyTries
      );
    }

    // Find user by username or email
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: userLoginDto.username },
          { email: userLoginDto.username }
        ]
      },
      include: { role: true },
      take: 1
    });

    const user = users[0];

    if (!user) {
      const [result, throttleError] = await this.limitConsumerPromiseHandler(
        usernameIPkey
      );
      if (!result) {
        throw new CustomHttpException(
          `tooManyRequest-{"second":${String(
            Math.round(throttleError.msBeforeNext / 1000) || 1
          )}}`,
          HttpStatus.TOO_MANY_REQUESTS,
          StatusCodesList.TooManyTries
        );
      }
      throw new UnauthorizedException(
        ExceptionTitleList.InvalidCredentials,
        StatusCodesList.InvalidCredentials
      );
    }

    // Validate password
    const hashedPassword = await bcrypt.hash(userLoginDto.password, user.salt);
    if (hashedPassword !== user.password) {
      const [result, throttleError] = await this.limitConsumerPromiseHandler(
        usernameIPkey
      );
      if (!result) {
        throw new CustomHttpException(
          `tooManyRequest-{"second":${String(
            Math.round(throttleError.msBeforeNext / 1000) || 1
          )}}`,
          HttpStatus.TOO_MANY_REQUESTS,
          StatusCodesList.TooManyTries
        );
      }
      throw new UnauthorizedException(
        ExceptionTitleList.InvalidCredentials,
        StatusCodesList.InvalidCredentials
      );
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        ExceptionTitleList.UserInactive,
        StatusCodesList.UserInactive
      );
    }

    const userSerializer = this.transformUser(user);
    const accessToken = await this.generateAccessToken(userSerializer);
    let refreshToken = null;
    if (userLoginDto.remember) {
      refreshToken = await this.refreshTokenService.generateRefreshToken(
        userSerializer,
        refreshTokenPayload
      );
    }
    await this.rateLimiter.delete(usernameIPkey);
    return this.buildResponsePayload(accessToken, refreshToken);
  }

  /**
   * Transform user to UserSerializer
   * @param user
   */
  private transformUser(user: User | UserWithRole): UserSerializer {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      address: user.address,
      contact: user.contact,
      avatar: user.avatar,
      status: user.status as any, // Convert UserStatus to UserStatusEnum
      isTwoFAEnabled: user.isTwoFAEnabled,
      roleId: user.roleId,
      tokenValidityDate: user.tokenValidityDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role:
        'role' in user && user.role
          ? {
              id: user.role.id,
              name: user.role.name,
              description: user.role.description,
              createdAt: user.role.createdAt,
              updatedAt: user.role.updatedAt,
              permission: [] // Will be populated when needed
            }
          : undefined
    };
  }

  /**
   * Generate access token
   * @param user
   * @param isTwoFAAuthenticated
   */
  public async generateAccessToken(
    user: UserSerializer,
    isTwoFAAuthenticated = false
  ): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
      expiresIn: jwtConfig.expiresIn
    };
    return this.jwt.signAsync({ isTwoFAAuthenticated }, opts);
  }

  /**
   * handle promise for rate limiter
   * @param usernameIPkey
   */
  async limitConsumerPromiseHandler(
    usernameIPkey: string
  ): Promise<[RateLimiterRes | null, RateLimiterRes | null]> {
    try {
      const rateLimiterConsume = await this.rateLimiter.consume(usernameIPkey);
      return [rateLimiterConsume, null];
    } catch (rateLimiterError) {
      return [null, rateLimiterError];
    }
  }

  /**
   * get user profile
   * @param user
   */
  async get(user: UserWithRole): Promise<UserSerializer> {
    return this.transformUser(user);
  }

  /**
   * find user by id
   * @param id
   */
  async findById(id: number): Promise<UserSerializer> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
    if (!user) {
      throw new NotFoundException(
        ExceptionTitleList.NotFound,
        StatusCodesList.NotFound
      );
    }

    return this.transformUser(user);
  }

  /**
   * Get all user paginated
   * @param userSearchFilterDto
   */
  async findAll(
    userSearchFilterDto: UserSearchFilterDto
  ): Promise<Pagination<UserSerializer>> {
    const { page = 1, limit = 10 } = userSearchFilterDto;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    // Add search functionality if needed based on DTO structure

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        include: {
          role: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

    const serializedUsers = users.map((user) => this.transformUser(user));

    return new Pagination({
      results: serializedUsers,
      currentPage: page,
      pageSize: limit,
      totalItems: total,
      next: page < Math.ceil(total / limit) ? page + 1 : null,
      previous: page > 1 ? page - 1 : null
    });
  }

  /**
   * update user
   * @param id
   * @param updateUserDto
   */
  async update(
    id: number,
    updateUserDto: Prisma.UserUpdateInput
  ): Promise<UserSerializer> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
    if (!user) {
      throw new NotFoundException(
        ExceptionTitleList.NotFound,
        StatusCodesList.NotFound
      );
    }

    if (updateUserDto.username || updateUserDto.email) {
      const whereConditions: Array<any> = [];

      if (updateUserDto.username) {
        whereConditions.push({ username: updateUserDto.username });
      }

      if (updateUserDto.email) {
        whereConditions.push({ email: updateUserDto.email });
      }

      const existingUsers = await this.prisma.user.findMany({
        where: {
          OR: whereConditions,
          NOT: {
            id: id
          }
        }
      });

      if (existingUsers.length > 0) {
        const errorPayload: ValidationPayloadInterface[] = [];
        existingUsers.forEach((existingUser) => {
          if (
            updateUserDto.username &&
            existingUser.username === updateUserDto.username
          ) {
            errorPayload.push({
              property: 'username',
              constraints: { unique: 'already taken' }
            });
          }
          if (
            updateUserDto.email &&
            existingUser.email === updateUserDto.email
          ) {
            errorPayload.push({
              property: 'email',
              constraints: { unique: 'already taken' }
            });
          }
        });
        throw new UnprocessableEntityException(errorPayload);
      }
    }

    // Handle avatar deletion
    if (updateUserDto.avatar && user.avatar) {
      const path = `public/images/profile/${user.avatar}`;
      if (existsSync(path)) {
        unlinkSync(`public/images/profile/${user.avatar}`);
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto
    });

    return this.transformUser(updatedUser);
  }

  /**
   * account activate
   * @param token
   */
  async activateAccount(token: string): Promise<void> {
    const users = await this.prisma.user.findMany({
      where: { token },
      take: 1
    });

    if (users.length === 0) {
      throw new UnprocessableEntityException('Token invalid');
    }

    const user = users[0];
    const currentDateTime = new Date();

    if (user.tokenValidityDate < currentDateTime) {
      throw new UnprocessableEntityException('Token expired');
    }

    const newToken = await this.generateUniqueToken(6);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.ACTIVE,
        token: newToken
      }
    });
  }

  /**
   * forget password
   * @param forgetPasswordDto
   */
  async forgotPassword(forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    const { email } = forgetPasswordDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
    if (!user) {
      return;
    }

    const token = await this.generateUniqueToken(12);
    const userSerializer = this.transformUser(user);

    const currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        token,
        tokenValidityDate: currentDateTime
      }
    });

    await this.sendMailToUser(
      userSerializer,
      'Reset Password',
      `reset/${token}`,
      'reset-password',
      'Reset Password'
    );
  }

  /**
   * reset password
   * @param resetPasswordDto
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { password, token } = resetPasswordDto;
    const users = await this.prisma.user.findMany({
      where: {
        token,
        tokenValidityDate: {
          gte: new Date()
        }
      },
      take: 1
    });

    if (users.length === 0) {
      throw new UnprocessableEntityException('Token invalid or expired');
    }

    const user = users[0];
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        salt,
        token: await this.generateUniqueToken(6)
      }
    });
  }

  /**
   * change password
   * @param user
   * @param changePasswordDto
   */
  async changePassword(
    user: UserWithRole,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const { oldPassword, password } = changePasswordDto;

    const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidOldPassword) {
      throw new UnauthorizedException(
        ExceptionTitleList.Unauthorized,
        StatusCodesList.UnauthorizedAccess
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        salt
      }
    });
  }

  /**
   * generate random string code providing length
   * @param length
   * @param uppercase
   * @param lowercase
   * @param numerical
   */
  generateRandomCode(
    length: number,
    uppercase = true,
    lowercase = true,
    numerical = true
  ): string {
    let result = '';
    const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let characters = '';
    if (lowercase) {
      characters += lowerCaseAlphabets;
    }
    if (uppercase) {
      characters += upperCaseAlphabets;
    }
    if (numerical) {
      characters += numbers;
    }

    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * generate unique token for password reset
   * @param length
   */
  async generateUniqueToken(length: number): Promise<string> {
    let token: string;
    let tokenCount: number;

    do {
      token = this.generateRandomCode(length);
      tokenCount = await this.prisma.user.count({
        where: { token }
      });
    } while (tokenCount > 0);

    return token;
  }

  /**
   * get cookie expiry for logout
   */
  getCookieForLogOut(): string[] {
    const isSecure =
      process.env.NODE_ENV === 'production' &&
      process.env.IS_HTTPS_ENABLED === 'true';
    const authCookie = `Authentication=; HttpOnly; SameSite=${
      isSameSite ? 'Strict' : 'None'
    }; Path=/; Max-Age=0; ${isSecure ? 'Secure' : ''}`;
    const refreshCookie = `Refresh=; HttpOnly; SameSite=${
      isSameSite ? 'Strict' : 'None'
    }; Path=/; Max-Age=0; ${isSecure ? 'Secure' : ''}`;
    return [authCookie, refreshCookie];
  }

  /**
   * set response cookie
   * @param accessToken
   * @param refreshToken
   */
  buildResponsePayload(accessToken: string, refreshToken?: string): string[] {
    const isSecure =
      process.env.NODE_ENV === 'production' &&
      process.env.IS_HTTPS_ENABLED === 'true';
    let expiredAt = jwtConfig.expiresIn;
    if (typeof expiredAt === 'string') {
      expiredAt = jwtConfig.expiresIn;
    }
    const authCookie = `Authentication=${accessToken}; HttpOnly; SameSite=${
      isSameSite ? 'Strict' : 'None'
    }; Path=/; Max-Age=${expiredAt}; ${isSecure ? 'Secure' : ''}`;
    if (refreshToken) {
      const refreshExpiredAt = jwtConfig.refreshExpiresIn;
      const refreshCookie = `Refresh=${refreshToken}; HttpOnly; SameSite=${
        isSameSite ? 'Strict' : 'None'
      }; Path=/; Max-Age=${refreshExpiredAt}; ${isSecure ? 'Secure' : ''}`;
      return [authCookie, refreshCookie];
    }
    return [authCookie];
  }

  /**
   * Create access token from refresh token
   * @param refreshToken
   */
  async createAccessTokenFromRefreshToken(
    refreshToken: string
  ): Promise<string[]> {
    try {
      const { token } =
        await this.refreshTokenService.createAccessTokenFromRefreshToken(
          refreshToken
        );
      return this.buildResponsePayload(token);
    } catch (error) {
      // Return logout cookies on error
      return this.getCookieForLogOut();
    }
  }

  /**
   * revoke refresh token for logout action
   * @param encoded
   */
  async revokeRefreshToken(encoded: string): Promise<void> {
    await this.refreshTokenService.revokeRefreshToken(encoded);
  }

  /**
   * get active refresh token list for user
   * @param userId
   * @param filter
   **/
  activeRefreshTokenList(
    userId: number,
    filter: RefreshPaginateFilterDto
  ): Promise<Pagination<RefreshTokenSerializer>> {
    return this.refreshTokenService.getRefreshTokenByUserId(userId, filter);
  }

  /**
   * revoke token by id
   * @param id
   * @param userId
   **/
  revokeTokenById(id: number, userId: number): Promise<RefreshToken> {
    return this.refreshTokenService.revokeRefreshTokenById(id, userId);
  }

  /**
   * turn on/off two factor authentication
   **/
  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFASecret: secret
      }
    });
  }

  /**
   * Turn two factor authentication for user
   * @param user
   * @param isTwoFAEnabled
   * @param qrDataUri
   **/
  async turnOnTwoFactorAuthentication(
    user: UserWithRole,
    isTwoFAEnabled = true,
    qrDataUri: string
  ) {
    const userSerializer = this.transformUser(user);
    if (isTwoFAEnabled) {
      await this.sendMailToUser(
        userSerializer,
        '2FA Enabled',
        qrDataUri,
        'two-fa-enabled',
        '2FA'
      );
    }
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        isTwoFAEnabled
      }
    });
  }

  /**
   * count user by condition
   **/
  async countByCondition(condition: Prisma.UserWhereInput) {
    return this.prisma.user.count({ where: condition });
  }

  async getRefreshTokenGroupedData(field: string) {
    return this.refreshTokenService.getRefreshTokenGroupedData(field);
  }
}
