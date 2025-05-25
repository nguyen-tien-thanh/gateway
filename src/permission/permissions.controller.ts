import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

import { PermissionsService } from 'src/permission/permissions.service';
import { CreatePermissionDto } from 'src/permission/dto/create-permission.dto';
import { UpdatePermissionDto } from 'src/permission/dto/update-permission.dto';
import { PermissionPaginateFilterDto } from 'src/permission/dto/permission-paginate-filter.dto';
import { PermissionSerializer } from 'src/permission/serializer/permission.serializer';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { Pagination } from 'src/paginate';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';

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
  ): Promise<PermissionSerializer> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  findAll(
    @Query()
    permissionFilterDto: PermissionPaginateFilterDto
  ): Promise<Pagination<PermissionSerializer>> {
    return this.permissionsService.findAll(permissionFilterDto);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string
  ): Promise<PermissionSerializer> {
    return this.permissionsService.findById(+id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionSerializer> {
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
  getPermissionForRoleAssignment(): Promise<PermissionSerializer[]> {
    return this.permissionsService.getPermissionForRoleAssignment();
  }
}
