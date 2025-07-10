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
import { CallService } from './call.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IFilter, Filter } from 'src/common/decorators/filter.decorator';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { CreateCallDto, UpdateCallDto } from './call.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';

@ApiTags('calls')
@Controller('calls')
@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Get('count')
  count(@Filter() filter: IFilter) {
    return this.callService.count(filter);
  }

  @Post()
  create(@Body() createCallDto: CreateCallDto, @GetUser() user: UserWithRole) {
    return this.callService.create({
      ...createCallDto,
      createdBy: user.id
    });
  }

  @Get()
  findAll(@Filter() filter: IFilter, @GetUser() user: UserWithRole) {
    return this.callService.findAll({
      ...filter,
      where: { ...filter.where, ...(user.ext && { ext: user.ext }) }
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.callService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCallDto: UpdateCallDto) {
    return this.callService.update(+id, updateCallDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.callService.remove(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.callService.restore(+id);
  }

  @Delete(':id/hard')
  hardDelete(@Param('id') id: string) {
    return this.callService.hardDelete(+id);
  }
}
