import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as config from 'config';

import { UserRepository } from 'src/auth/user.repository';
import { UserWithRole } from 'src/auth/models/user.model';

const jwtConfig = config.get('jwt');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request) => request?.cookies?.Authentication
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret
    });
  }

  async validate(payload: any): Promise<UserWithRole> {
    const { sub: id } = payload;
    const user = await this.userRepository.findById(Number(id));

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
