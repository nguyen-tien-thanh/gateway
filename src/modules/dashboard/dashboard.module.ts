import { Module } from '@nestjs/common';
import { DashboardService } from 'src/modules/dashboard/dashboard.service';
import { DashboardController } from 'src/modules/dashboard/dashboard.controller';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  controllers: [DashboardController],
  imports: [AuthModule],
  providers: [DashboardService]
})
export class DashboardModule {}
