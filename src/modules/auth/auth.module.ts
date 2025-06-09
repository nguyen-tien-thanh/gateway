import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as Redis from 'ioredis';

import { AuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
// import { MailModule } from 'src/modules/mail/mail.module';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RefreshTokenModule } from 'src/modules/refresh-token/refresh-token.module';
import { JwtTwoFactorStrategy } from 'src/common/strategy/jwt-two-factor.strategy';
import { JwtStrategy } from 'src/common/strategy/jwt.strategy';

const LoginThrottleFactory = {
  provide: 'LOGIN_THROTTLE',
  useFactory: () => {
    const redisClient = new Redis({
      enableOfflineQueue: false,
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || ''
    });

    return new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: process.env.THROTTLE_LOGIN_PREFIX || 'login_fail_throttle',
      points: Number(process.env.THROTTLE_LOGIN_LIMIT) || 5,
      duration: Number(process.env.THROTTLE_LOGIN_DURATION) || 60 * 60 * 24 * 30, // Store number for 30 days since first fail
      blockDuration: Number(process.env.THROTTLE_LOGIN_BLOCK_DURATION) || 3000
    });
  }
};

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'example@123',
        signOptions: {
          expiresIn: Number(process.env.JWT_EXPIRES_IN) || 900
        }
      })
    }),
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    // MailModule,
    RefreshTokenModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTwoFactorStrategy,
    JwtStrategy,
    LoginThrottleFactory
  ],
  exports: [
    AuthService,
    JwtTwoFactorStrategy,
    JwtStrategy,
    PassportModule,
    JwtModule
  ]
})
export class AuthModule {}
