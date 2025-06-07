import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [MaintenanceController],
  providers: [MaintenanceService]
})
export class MaintenanceModule {}
