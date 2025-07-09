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
import { CallTypeService } from './call-type.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IFilter, Filter } from 'src/common/decorators/filter.decorator';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { CreateCallTypeDto, UpdateCallTypeDto } from './call-type.dto';

@ApiTags('call-types')
@Controller('call-types')
@ApiBearerAuth()
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
export class CallTypeController {
  constructor(private readonly callTypeService: CallTypeService) {}

  @Get('count')
  count(@Filter() filter: IFilter) {
    return this.callTypeService.count(filter);
  }

  @Post()
  create(@Body() createCallTypeDto: CreateCallTypeDto) {
    return this.callTypeService.create(createCallTypeDto);
  }

  @Get()
  findAll(@Filter() filter: IFilter) {
    return this.callTypeService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.callTypeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCallTypeDto: UpdateCallTypeDto
  ) {
    return this.callTypeService.update(+id, updateCallTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.callTypeService.remove(+id);
  }
}
