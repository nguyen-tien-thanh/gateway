import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { RefreshToken, Prisma } from '@prisma/client';

import { CustomHttpException } from 'src/common/exception/custom-http.exception';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserSerializer } from 'src/modules/auth/serializer/user.serializer';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ForbiddenException } from 'src/common/exception/forbidden.exception';
import { NotFoundException } from 'src/common/exception/not-found.exception';
import { RefreshTokenInterface } from 'src/modules/refresh-token/interface/refresh-token.interface';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { RefreshPaginateFilterDto } from 'src/modules/refresh-token/dto/refresh-paginate-filter.dto';
import { RefreshTokenSerializer } from 'src/modules/refresh-token/serializer/refresh-token.serializer';
import { Pagination } from 'src/shared/paginate';

const BASE_OPTIONS: SignOptions = {
  issuer: process.env.APP_URL || 'http://localhost:7777',
  audience: process.env.FRONTEND_URL || 'http://localhost:3000'
};

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly jwt: JwtService
  ) {}

  /**
   * Generate refresh token
   * @param user
   * @param refreshToken
   */
  public async generateRefreshToken(
    user: UserSerializer,
    refreshToken: Partial<RefreshToken>
  ): Promise<string> {
    const token = await this.createRefreshToken(user, refreshToken);
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
      jwtid: String(token.id)
    };

    return this.jwt.signAsync(
      { ...opts },
      {
        expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN) || 604800
      }
    );
  }

  /**
   * Create refresh token in database
   * @param user
   * @param refreshToken
   */
  private async createRefreshToken(
    user: UserSerializer,
    refreshToken: Partial<RefreshToken>
  ): Promise<RefreshToken> {
    const tokenData: Prisma.RefreshTokenCreateInput = {
      ip: refreshToken.ip || '',
      userAgent: refreshToken.userAgent || '',
      browser: refreshToken.browser || '',
      os: refreshToken.os || '',
      isRevoked: false,
      expires:
        refreshToken.expires ||
        new Date(Date.now() + (Number(process.env.JWT_REFRESH_EXPIRES_IN) || 604800) * 1000),
      user: { connect: { id: user.id } }
    };

    return this.prisma.refreshToken.create({ data: tokenData });
  }

  /**
   * Resolve encoded refresh token
   * @param encoded
   */
  public async resolveRefreshToken(encoded: string): Promise<{
    user: UserSerializer;
    token: RefreshToken;
  }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);
    if (!token) {
      throw new CustomHttpException(
        ExceptionTitleList.NotFound,
        HttpStatus.NOT_FOUND,
        StatusCodesList.NotFound
      );
    }

    if (token.isRevoked) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    return {
      user,
      token
    };
  }

  /**
   * Create access token from refresh token
   * @param refresh
   */
  public async createAccessTokenFromRefreshToken(refresh: string): Promise<{
    token: string;
    user: UserSerializer;
  }> {
    const { user } = await this.resolveRefreshToken(refresh);
    const token = await this.authService.generateAccessToken(user);
    return {
      user,
      token
    };
  }

  /**
   * Decode refresh token
   * @param token
   */
  async decodeRefreshToken(token: string): Promise<RefreshTokenInterface> {
    try {
      return await this.jwt.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new CustomHttpException(
          ExceptionTitleList.RefreshTokenExpired,
          HttpStatus.BAD_REQUEST,
          StatusCodesList.RefreshTokenExpired
        );
      } else {
        throw new CustomHttpException(
          ExceptionTitleList.InvalidRefreshToken,
          HttpStatus.BAD_REQUEST,
          StatusCodesList.InvalidRefreshToken
        );
      }
    }
  }

  /**
   * get user detail from refresh token
   * @param payload
   */
  async getUserFromRefreshTokenPayload(
    payload: RefreshTokenInterface
  ): Promise<UserSerializer> {
    const subId = payload.subject;

    if (!subId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    return this.authService.findById(+subId);
  }

  /**
   * Get refresh token entity from token payload
   * @param payload
   */
  async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenInterface
  ): Promise<RefreshToken | null> {
    const tokenId = payload.jwtid;

    if (!tokenId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken
      );
    }

    return this.prisma.refreshToken.findUnique({ where: { id: +tokenId } });
  }

  /**
   * Get active refresh token list of user
   * @param userId
   */
  async getRefreshTokenByUserId(
    userId: number,
    filter: RefreshPaginateFilterDto
  ): Promise<Pagination<RefreshTokenSerializer>> {
    const { page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.RefreshTokenWhereInput = {
      userId,
      isRevoked: false,
      expires: { gte: new Date() }
    };

    const [results, total] = await Promise.all([
      this.prisma.refreshToken.findMany({
        skip,
        take: limit,
        where,
        orderBy: { id: 'desc' },
        include: { user: true }
      }),
      this.prisma.refreshToken.count({ where })
    ]);

    const serializedResults = results.map((token) =>
      this.transformToken(token)
    );

    return new Pagination<RefreshTokenSerializer>({
      results: serializedResults,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : null,
      next: page < Math.ceil(total / limit) ? page + 1 : null
    });
  }

  /**
   * Transform token to serializer format
   * @param token
   */
  private transformToken(token: any): RefreshTokenSerializer {
    return {
      id: token.id,
      userId: token.userId,
      ip: token.ip,
      userAgent: token.userAgent,
      browser: token.browser,
      os: token.os,
      isRevoked: token.isRevoked,
      expires: token.expires,
      createdAt: token.createdAt || new Date(),
      updatedAt: token.updatedAt || new Date()
    };
  }

  /**
   * Revoke refresh token by id
   * @param id
   * @param userId
   */
  async revokeRefreshTokenById(
    id: number,
    userId: number
  ): Promise<RefreshToken> {
    const token = await this.prisma.refreshToken.findUnique({ where: { id } });
    if (!token) {
      throw new NotFoundException('Refresh token not found');
    }
    if (token.userId !== userId) {
      throw new ForbiddenException('Not authorized to revoke this token');
    }

    return this.prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true }
    });
  }

  /**
   * Get grouped data for dashboard
   * @param field
   */
  async getRefreshTokenGroupedData(field: string) {
    // This would need to be implemented using Prisma's groupBy functionality
    // For now, returning empty array as placeholder
    return [];
  }

  /**
   * Revoke refresh token by encoded token
   * @param encoded
   */
  async revokeRefreshToken(encoded: string): Promise<void> {
    const payload = await this.decodeRefreshToken(encoded);
    const tokenId = payload.jwtid;

    if (tokenId) {
      await this.prisma.refreshToken.update({
        where: { id: +tokenId },
        data: { isRevoked: true }
      });
    }
  }
}
