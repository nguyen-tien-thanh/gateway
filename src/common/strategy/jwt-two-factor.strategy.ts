import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UserWithRole } from 'src/modules/auth/models/user.model';

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
      secretOrKey: process.env.JWT_SECRET || 'example@123'
    });
  }

  async validate(payload: any): Promise<UserWithRole> {
    const { subject: id, isTwoFAAuthenticated } = payload;
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        role: { include: { permissions: { include: { permission: true } } } }
      }
    });

    if (!user) throw new UnauthorizedException();

    if (user.isTwoFAEnabled && !isTwoFAAuthenticated) {
      throw new UnauthorizedException();
    }

    const userWithRole: UserWithRole = {
      ...user,
      role: user.role
        ? {
            ...user.role,
            permissions: user.role.permissions.map((rp) => rp.permission)
          }
        : undefined
    };

    return userWithRole;
  }
}
