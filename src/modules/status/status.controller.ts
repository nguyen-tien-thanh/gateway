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
import { StatusService } from './status.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IFilter, Filter } from 'src/common/decorators/filter.decorator';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { CreateStatusDto, UpdateStatusDto } from './status.dto';

@ApiTags('statuses')
@Controller('statuses')
@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get('count')
  count(@Filter() filter: IFilter) {
    return this.statusService.count(filter);
  }

  @Post()
  create(@Body() createStatusDto: CreateStatusDto) {
    return this.statusService.create(createStatusDto);
  }

  @Get()
  findAll(@Filter() filter: IFilter) {
    return this.statusService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.statusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.statusService.update(+id, updateStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.statusService.remove(+id);
  }
}
