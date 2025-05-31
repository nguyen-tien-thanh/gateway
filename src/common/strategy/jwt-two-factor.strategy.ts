import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as config from 'config';

import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UserWithRole } from 'src/modules/auth/models/user.model';

const jwtConfig = config.get('jwt');

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor'
) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request) => request?.cookies?.Authentication
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret
    });
  }

  async validate(payload: any): Promise<UserWithRole> {
    const { sub: id, isTwoFAAuthenticated } = payload;
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
      include: { role: true }
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.isTwoFAEnabled && !isTwoFAAuthenticated) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
