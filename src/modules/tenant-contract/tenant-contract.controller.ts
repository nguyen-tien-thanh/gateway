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
import { TenantContractService } from './tenant-contract.service';
import {
  CreateTenantContractDto,
  UpdateTenantContractDto
} from './tenant-contract.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { Filter } from 'src/common/decorators/filter.decorator';

@ApiTags('tenant-contract')
@Controller('tenant-contract')
export class TenantContractController {
  constructor(private readonly tenantContractService: TenantContractService) {}

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Post()
  create(
    @Body() createTenantContractDto: CreateTenantContractDto,
    @GetUser() user: UserWithRole
  ) {
    return this.tenantContractService.create({
      ...createTenantContractDto,
      createdBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get()
  findAll(@Filter() filter?: IFilter) {
    return this.tenantContractService.findAll(filter);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantContractService.findOne(+id);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTenantContractDto: UpdateTenantContractDto,
    @GetUser() user: UserWithRole
  ) {
    return this.tenantContractService.update(+id, {
      ...updateTenantContractDto,
      updatedBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantContractService.remove(+id);
  }
}
