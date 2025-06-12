import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { RolesService } from 'src/modules/role/roles.service';
import { CreateRoleDto } from 'src/modules/role/dto/create-role.dto';
import { UpdateRoleDto } from 'src/modules/role/dto/update-role.dto';
import { RoleSerializer } from 'src/modules/role/serializer/role.serializer';
import { Pagination } from 'src/shared/paginate';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { Filter } from 'src/common/decorators/filter.decorator';

@ApiTags('roles')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('roles')
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(
    @Body()
    createRoleDto: CreateRoleDto
  ): Promise<RoleSerializer> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  findAll(@Filter() filter: IFilter): Promise<Pagination<RoleSerializer>> {
    return this.rolesService.findAll(filter);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string
  ): Promise<RoleSerializer> {
    return this.rolesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateRoleDto: UpdateRoleDto
  ): Promise<RoleSerializer> {
    return this.rolesService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string
  ): Promise<void> {
    return this.rolesService.remove(+id);
  }
}
