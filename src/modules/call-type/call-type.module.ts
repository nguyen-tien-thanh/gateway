import { Module } from '@nestjs/common';
import { CallTypeService } from './call-type.service';
import { CallTypeController } from './call-type.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [CallTypeController],
  providers: [CallTypeService, PrismaService],
  exports: [CallTypeService]
})
export class CallTypeModule {}
