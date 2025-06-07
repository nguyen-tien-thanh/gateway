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
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto, UpdateMaintenanceDto } from './maintenance.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserWithRole } from '../auth/models/user.model';
import { Filter } from 'src/common/decorators/filter.decorator';
import { IFilter } from 'src/common/decorators/filter.decorator';

@ApiTags('maintenance')
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Post()
  create(
    @Body() createMaintenanceDto: CreateMaintenanceDto,
    @GetUser() user: UserWithRole
  ) {
    return this.maintenanceService.create({
      ...createMaintenanceDto,
      createdBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get()
  findAll(@Filter() filter?: IFilter) {
    return this.maintenanceService.findAll(filter);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(+id);
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMaintenanceDto: UpdateMaintenanceDto,
    @GetUser() user: UserWithRole
  ) {
    return this.maintenanceService.update(+id, {
      ...updateMaintenanceDto,
      updatedBy: user.id
    });
  }

  @UseGuards(JwtTwoFactorGuard, PermissionGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(+id);
  }
}
