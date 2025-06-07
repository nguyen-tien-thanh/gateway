import { Module } from '@nestjs/common';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';
import { QRCodeController } from './qr-code.controller';
import { QRCodeService } from './qr-code.service';

@Module({
  imports: [RabbitMQModule],
  controllers: [QRCodeController],
  providers: [QRCodeService]
})
export class QRCodeModule {}
