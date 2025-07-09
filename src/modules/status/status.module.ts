import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [StatusController],
  providers: [StatusService, PrismaService],
  exports: [StatusService]
})
export class StatusModule {}
