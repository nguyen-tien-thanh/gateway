import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [SummaryController],
  providers: [SummaryService, PrismaService],
  exports: [SummaryService]
})
export class SummaryModule {}
