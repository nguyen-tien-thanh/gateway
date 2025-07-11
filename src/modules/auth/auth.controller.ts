import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import * as UAParser from 'ua-parser-js';
import { RefreshToken, UserStatus } from '@prisma/client';

import { AuthService } from 'src/modules/auth/auth.service';
import { ChangePasswordDto } from 'src/modules/auth/dto/change-password.dto';
import { CreateUserDto } from 'src/modules/auth/dto/create-user.dto';
import { ForgetPasswordDto } from 'src/modules/auth/dto/forget-password.dto';
import { RegisterUserDto } from 'src/modules/auth/dto/register-user.dto';
import { ResetPasswordDto } from 'src/modules/auth/dto/reset-password.dto';
import { UpdateUserDto } from 'src/modules/auth/dto/update-user.dto';
import { UpdateUserProfileDto } from 'src/modules/auth/dto/update-user-profile.dto';
import { UserLoginDto } from 'src/modules/auth/dto/user-login.dto';
import { LdapLoginDto } from 'src/modules/auth/dto/ldap-login.dto';
import { UserSerializer } from 'src/modules/auth/serializer/user.serializer';
import { multerOptionsHelper } from 'src/common/helper/multer-options.helper';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Pagination } from 'src/shared/paginate';
import { RefreshTokenSerializer } from 'src/modules/refresh-token/serializer/refresh-token.serializer';
import { UserWithRole } from 'src/modules/auth/models/user.model';
import { Filter } from 'src/common/decorators/filter.decorator';
import { IFilter } from 'src/common/decorators/filter.decorator';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/auth/register')
  register(
    @Body(ValidationPipe)
    registerUserDto: RegisterUserDto
  ): Promise<UserSerializer> {
    // Convert DTO to Prisma UserCreateInput
    const userCreateInput = {
      username: registerUserDto.username,
      email: registerUserDto.email,
      password: registerUserDto.password,
      name: registerUserDto.name,
      address: '',
      contact: '',
      avatar: '',
      status: 'INACTIVE' as UserStatus,
      token: '',
      salt: '', // Will be generated in service
      role: { connect: { id: 2 } } // Default user role
    };
    return this.authService.create(userCreateInput);
  }

  @Post('/auth/login')
  async login(
    @Req() req: Request,
    @Res() response: Response,
    @Body() userLoginDto: UserLoginDto
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const refreshTokenPayload: Partial<RefreshToken> = {
      ip: req.ip,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name,
      userId: 0, // Will be set by service
      isRevoked: false,
      expires: new Date()
    };
    const cookiePayload = await this.authService.login(
      userLoginDto,
      refreshTokenPayload
    );
    response.setHeader('Set-Cookie', cookiePayload);
    return response.status(HttpStatus.NO_CONTENT).json({});
  }

  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() response: Response) {
    try {
      const cookiePayload =
        await this.authService.createAccessTokenFromRefreshToken(
          req.cookies['Refresh']
        );
      response.setHeader('Set-Cookie', cookiePayload);
      return response.status(HttpStatus.NO_CONTENT).json({});
    } catch (e) {
      response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
      return response.sendStatus(HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/auth/activate-account')
  @HttpCode(HttpStatus.NO_CONTENT)
  activateAccount(@Query('token') token: string): Promise<void> {
    return this.authService.activateAccount(token);
  }

  @Put('/auth/forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(@Body() forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    return this.authService.forgotPassword(forgetPasswordDto);
  }

  @Put('/auth/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('/auth/profile')
  profile(@GetUser() user: UserWithRole): Promise<UserSerializer> {
    return this.authService.get(user);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Put('/auth/profile')
  @UseInterceptors(
    FileInterceptor(
      'avatar',
      multerOptionsHelper('public/images/profile', 1000000)
    )
  )
  updateProfile(
    @GetUser() user: UserWithRole,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateUserDto: UpdateUserProfileDto
  ): Promise<UserSerializer> {
    if (file) updateUserDto.avatar = file.filename;
    return this.authService.update(user.id, updateUserDto);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Put('/auth/change-password')
  changePassword(
    @GetUser() user: UserWithRole,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    return this.authService.changePassword(user, changePasswordDto);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get('/users')
  findAll(@Filter() filter?: IFilter): Promise<Pagination<UserSerializer>> {
    return this.authService.findAll(filter);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Post('/users')
  create(
    @Body(ValidationPipe)
    createUserDto: CreateUserDto
  ): Promise<UserSerializer> {
    // hash password
    // Convert DTO to Prisma UserCreateInput
    const userCreateInput = {
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password || 'dx@123',
      name: createUserDto.name,
      address: '',
      contact: '',
      avatar: '',
      status: createUserDto.status || ('ACTIVE' as UserStatus),
      token: '',
      salt: '', // Will be generated in service
      role: { connect: { id: createUserDto.roleId } }
    };
    return this.authService.create(userCreateInput);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Patch('/users/:id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserSerializer> {
    // Convert DTO to Prisma UserUpdateInput
    const updateInput: any = {};
    if (updateUserDto.username) updateInput.username = updateUserDto.username;
    if (updateUserDto.email) updateInput.email = updateUserDto.email;
    if (updateUserDto.name) updateInput.name = updateUserDto.name;
    if (updateUserDto.address) updateInput.address = updateUserDto.address;
    if (updateUserDto.contact) updateInput.contact = updateUserDto.contact;
    if (updateUserDto.status) updateInput.status = updateUserDto.status;
    if (updateUserDto.ext) updateInput.ext = updateUserDto.ext;
    if (updateUserDto.roleId)
      updateInput.role = { connect: { id: updateUserDto.roleId } };

    return this.authService.update(+id, updateInput);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get('/users/:id')
  findOne(@Param('id') id: string): Promise<UserSerializer> {
    return this.authService.findById(+id);
  }

  @Post('/logout')
  async logOut(@Req() req: Request, @Res() response: Response) {
    try {
      const cookie = req.cookies['Refresh'];
      response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
      const refreshCookie = req.cookies['Refresh'];
      if (refreshCookie) {
        await this.authService.revokeRefreshToken(cookie);
      }
      return response.sendStatus(HttpStatus.NO_CONTENT);
    } catch (e) {
      return response.sendStatus(HttpStatus.NO_CONTENT);
    }
  }

  @UseGuards(JwtTwoFactorGuard)
  @Get('/auth/token-info')
  getRefreshToken(
    @GetUser() user: UserWithRole,
    @Filter() filter: IFilter
  ): Promise<Pagination<RefreshTokenSerializer>> {
    return this.authService.activeRefreshTokenList(+user.id, filter);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Delete('/users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): Promise<void> {
    return this.authService.delete(+id);
  }

  @UseGuards(JwtTwoFactorGuard)
  @Put('/revoke/:id')
  revokeToken(
    @Param('id')
    id: string,
    @GetUser()
    user: UserWithRole
  ): Promise<RefreshToken> {
    return this.authService.revokeTokenById(+id, +user.id);
  }

  @Post('/auth/ldap-login')
  async ldapLogin(
    @Req() req: Request,
    @Res() response: Response,
    @Body() ldapLoginDto: LdapLoginDto
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const refreshTokenPayload: Partial<RefreshToken> = {
      ip: req.ip,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name,
      userId: 0, // Will be set by service
      isRevoked: false,
      expires: new Date()
    };
    const tokenResponse = await this.authService.loginWithLdap(
      ldapLoginDto,
      refreshTokenPayload
    );
    return response.status(HttpStatus.OK).json(tokenResponse);
  }

  @Post('/auth/ldap-refresh')
  async ldapRefresh(
    @Req() req: Request,
    @Res() response: Response,
    @Body() refreshTokenDto: RefreshToken
  ) {
    const ua = UAParser(req.headers['user-agent']);
    const refreshTokenPayload: Partial<RefreshToken> = {
      ip: req.ip,
      userAgent: JSON.stringify(ua),
      browser: ua.browser.name,
      os: ua.os.name,
      userId: 0, // Will be set by service
      isRevoked: false,
      expires: new Date()
    };
    const tokenResponse = await this.authService.refreshLdapToken(
      refreshTokenDto,
      refreshTokenPayload
    );
    return response.status(HttpStatus.OK).json(tokenResponse);
  }
}
