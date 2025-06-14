import { Module } from '@nestjs/common';
import { ResourceMemberService } from './resource-member.service';
import { ResourceMemberController } from './resource-member.controller';
import { RabbitMQModule } from 'src/shared/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMQModule],
  controllers: [ResourceMemberController],
  providers: [ResourceMemberService],
  exports: [ResourceMemberService]
})
export class ResourceMemberModule {}
