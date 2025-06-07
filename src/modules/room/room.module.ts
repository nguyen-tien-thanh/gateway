import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [RoomController],
  providers: [RoomService]
})
export class RoomModule {}
