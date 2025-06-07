import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common';
import { QRCodeService } from './qr-code.service';
import { CreateQRCodeDto, UpdateQRCodeDto } from './qr-code.dto';
import { Filter } from 'src/common/decorators/filter.decorator';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('qr-code')
@Controller('qr-code')
export class QRCodeController {
  constructor(private readonly qrCodeService: QRCodeService) {}

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Post()
  create(
    @Body() createQRCodeDto: CreateQRCodeDto,
    @GetUser() user: UserWithRole
  ) {
    return this.qrCodeService.create({
      ...createQRCodeDto,
      createdBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get()
  findAll(@Filter() filter?: IFilter) {
    return this.qrCodeService.findAll(filter);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qrCodeService.findOne(+id);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQRCodeDto: UpdateQRCodeDto,
    @GetUser() user: UserWithRole
  ) {
    return this.qrCodeService.update(+id, {
      ...updateQRCodeDto,
      updatedBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qrCodeService.remove(+id);
  }
}
