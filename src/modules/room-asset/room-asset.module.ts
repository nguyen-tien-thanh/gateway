import { Module } from '@nestjs/common';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { RoomAssetService } from './room-asset.service';
import { RoomAssetController } from './room-asset.controller';

@Module({
  imports: [RabbitMQModule],
  controllers: [RoomAssetController],
  providers: [RoomAssetService],
  exports: [RoomAssetService]
})
export class RoomAssetModule {}
