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
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto } from './room.dto';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';
import { Filter } from 'src/common/decorators/filter.decorator';
import { IFilter } from 'src/common/decorators/filter.decorator';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Post()
  create(@Body() createRoomDto: CreateRoomDto, @GetUser() user: UserWithRole) {
    return this.roomService.create({
      ...createRoomDto,
      createdBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get()
  findAll(@Filter() filter?: IFilter) {
    return this.roomService.findAll(filter);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @GetUser() user: UserWithRole
  ) {
    return this.roomService.update(+id, {
      ...updateRoomDto,
      updatedBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
