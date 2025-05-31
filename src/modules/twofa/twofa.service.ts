import { HttpStatus, Injectable } from '@nestjs/common';
import * as config from 'config';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { toFileStream, toDataURL } from 'qrcode';

import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserWithRole } from 'src/modules/auth/models/user.model';
import { CustomHttpException } from 'src/common/exception/custom-http.exception';

const TwofaConfig = config.get('twofa');

@Injectable()
export class TwofaService {
  constructor(private readonly usersService: AuthService) {}

  async generateTwoFASecret(user: UserWithRole) {
    if (user.twoFAThrottleTime && user.twoFAThrottleTime > new Date()) {
      throw new CustomHttpException(
        `tooManyRequest-{"second":"${this.differentBetweenDatesInSec(
          user.twoFAThrottleTime,
          new Date()
        )}"}`,
        HttpStatus.TOO_MANY_REQUESTS,
        StatusCodesList.TooManyTries
      );
    }
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      TwofaConfig.authenticationAppNAme,
      secret
    );
    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);
    return {
      secret,
      otpauthUrl
    };
  }

  isTwoFACodeValid(twoFASecret: string, user: UserWithRole) {
    return authenticator.verify({
      token: twoFASecret,
      secret: user.twoFASecret || ''
    });
  }

  async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  async qrDataToUrl(otpauthUrl: string): Promise<string> {
    return toDataURL(otpauthUrl);
  }

  differentBetweenDatesInSec(initialDate: Date, endDate: Date): number {
    const diffInSeconds = Math.abs(initialDate.getTime() - endDate.getTime());
    return Math.round(diffInSeconds / 1000);
  }
}
