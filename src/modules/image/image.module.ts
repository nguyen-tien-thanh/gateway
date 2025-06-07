import { Module } from '@nestjs/common';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

@Module({
  imports: [RabbitMQModule],
  controllers: [ImageController],
  providers: [ImageService]
})
export class ImageModule {}
