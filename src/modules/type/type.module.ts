import { Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [TypeController],
  providers: [TypeService, PrismaService],
  exports: [TypeService]
})
export class TypeModule {}
