import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtTwoFactorGuard } from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { DashboardService } from 'src/modules/dashboard/dashboard.service';
import { OsStatsInterface } from 'src/modules/dashboard/interface/os-stats.interface';
import { UsersStatsInterface } from 'src/modules/dashboard/interface/user-stats.interface';
import { BrowserStatsInterface } from 'src/modules/dashboard/interface/browser-stats.interface';

@ApiTags('dashboard')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/users')
  userStat(): Promise<UsersStatsInterface> {
    return this.dashboardService.getUserStat();
  }

  @Get('/os')
  osStat(): Promise<Array<OsStatsInterface>> {
    return this.dashboardService.getOsData();
  }

  @Get('/browser')
  browserStat(): Promise<Array<BrowserStatsInterface>> {
    return this.dashboardService.getBrowserData();
  }
}
