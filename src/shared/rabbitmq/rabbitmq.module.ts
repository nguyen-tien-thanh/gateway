import { Module, Scope } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  providers: [
    {
      provide: RabbitMQService,
      useClass: RabbitMQService,
      scope: Scope.REQUEST
    }
  ],
  exports: [RabbitMQService]
})
export class RabbitMQModule {}
