import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common';
import { RoomAssetService } from './room-asset.service';
import { CreateRoomAssetDto, UpdateRoomAssetDto } from './room-asset.dto';
import { Filter } from 'src/common/decorators/filter.decorator';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from 'src/modules/auth/models/user.model';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('room-asset')
@Controller('room-asset')
export class RoomAssetController {
  constructor(private readonly roomAssetService: RoomAssetService) {}

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Post()
  create(
    @Body() createRoomAssetDto: CreateRoomAssetDto,
    @GetUser() user: UserWithRole
  ) {
    return this.roomAssetService.create({
      ...createRoomAssetDto,
      createdBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get()
  findAll(@Filter() filter?: IFilter) {
    return this.roomAssetService.findAll(filter);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomAssetService.findOne(+id);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoomAssetDto: UpdateRoomAssetDto,
    @GetUser() user: UserWithRole
  ) {
    return this.roomAssetService.update(+id, {
      ...updateRoomAssetDto,
      updatedBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomAssetService.remove(+id);
  }
}
