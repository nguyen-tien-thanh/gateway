import { Injectable } from '@nestjs/common';

import { UserStatusEnum } from 'src/modules/auth/user-status.enum';
import { AuthService } from 'src/modules/auth/auth.service';
import { UsersStatsInterface } from 'src/modules/dashboard/interface/user-stats.interface';
import { BrowserStatsInterface } from 'src/modules/dashboard/interface/browser-stats.interface';
import { OsStatsInterface } from 'src/modules/dashboard/interface/os-stats.interface';

@Injectable()
export class DashboardService {
  constructor(private readonly authService: AuthService) {}

  async getUserStat(): Promise<UsersStatsInterface> {
    const totalUserPromise = this.authService.countByCondition({});
    const totalActiveUserPromise = this.authService.countByCondition({
      status: UserStatusEnum.ACTIVE
    });
    const totalInActiveUserPromise = this.authService.countByCondition({
      status: UserStatusEnum.INACTIVE
    });
    const [total, active, inactive] = await Promise.all([
      totalUserPromise,
      totalActiveUserPromise,
      totalInActiveUserPromise
    ]);
    return {
      total,
      active,
      inactive
    };
  }

  getOsData(): Promise<Array<OsStatsInterface>> {
    return this.authService.getRefreshTokenGroupedData('os');
  }

  getBrowserData(): Promise<Array<BrowserStatsInterface>> {
    return this.authService.getRefreshTokenGroupedData('browser');
  }
}
