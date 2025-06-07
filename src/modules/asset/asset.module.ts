import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [AssetController],
  providers: [AssetService]
})
export class AssetModule {}
