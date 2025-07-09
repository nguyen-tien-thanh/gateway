import { Module } from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { TranscriptionController } from './transcription.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [TranscriptionController],
  providers: [TranscriptionService, PrismaService],
  exports: [TranscriptionService]
})
export class TranscriptionModule {}
