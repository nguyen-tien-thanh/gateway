import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Patch,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from 'src/modules/auth/auth.service';
import { UserWithRole } from 'src/modules/auth/models/user.model';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { TwofaCodeDto } from 'src/modules/twofa/dto/twofa-code.dto';
import { TwoFaStatusUpdateDto } from 'src/modules/twofa/dto/twofa-status-update.dto';
import { TwofaService } from 'src/modules/twofa/twofa.service';

@Controller('twofa')
export class TwofaController {
  constructor(
    private readonly twofaService: TwofaService,
    private readonly usersService: AuthService
  ) {}

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @Req()
    req: Request,
    @Res()
    response: Response,
    @GetUser()
    user: UserWithRole,
    @Body()
    twofaCodeDto: TwofaCodeDto
  ) {
    const isCodeValid = this.twofaService.isTwoFACodeValid(
      twofaCodeDto.code,
      user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('invalidOTP');
    }

    const userSerializer = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      address: user.address,
      contact: user.contact,
      avatar: user.avatar,
      status: user.status as any,
      isTwoFAEnabled: user.isTwoFAEnabled,
      roleId: user.roleId,
      tokenValidityDate: user.tokenValidityDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
            createdAt: user.role.createdAt,
            updatedAt: user.role.updatedAt,
            permission: []
          }
        : undefined
    };

    const accessToken = await this.usersService.generateAccessToken(
      userSerializer,
      true
    );
    const cookiePayload = this.usersService.buildResponsePayload(accessToken);
    response.setHeader('Set-Cookie', cookiePayload);
    return response.status(HttpStatus.NO_CONTENT).json({});
  }

  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async toggleTwoFa(
    @Body()
    twofaStatusUpdateDto: TwoFaStatusUpdateDto,
    @GetUser()
    user: UserWithRole
  ) {
    let qrDataUri = null;
    if (twofaStatusUpdateDto.isTwoFAEnabled) {
      const { otpauthUrl } = await this.twofaService.generateTwoFASecret(user);
      qrDataUri = await this.twofaService.qrDataToUrl(otpauthUrl);
    }
    return this.usersService.turnOnTwoFactorAuthentication(
      user,
      twofaStatusUpdateDto.isTwoFAEnabled,
      qrDataUri
    );
  }
}
