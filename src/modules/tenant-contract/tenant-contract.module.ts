import { Module } from '@nestjs/common';
import { TenantContractService } from './tenant-contract.service';
import { TenantContractController } from './tenant-contract.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [TenantContractController],
  providers: [TenantContractService]
})
export class TenantContractModule {}
