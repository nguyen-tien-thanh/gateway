import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PermissionsService } from 'src/modules/permission/permissions.service';
import {
  CreatePermissionDto,
  PermissionDto,
  UpdatePermissionDto
} from 'src/modules/permission/dto/permission.dto';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { Pagination } from 'src/shared/paginate';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { Filter } from 'src/common/decorators/filter.decorator';

@ApiTags('permissions')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('permissions')
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(
    @Body()
    createPermissionDto: CreatePermissionDto
  ): Promise<PermissionDto> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  findAll(@Filter() filter?: IFilter): Promise<Pagination<PermissionDto>> {
    return this.permissionsService.findAll(filter);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string
  ): Promise<PermissionDto> {
    return this.permissionsService.findById(+id);
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionDto> {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.permissionsService.remove(+id);
  }

  @Get('/assignment/list')
  getPermissionForRoleAssignment(): Promise<PermissionDto[]> {
    return this.permissionsService.getPermissionForRoleAssignment();
  }
}
