import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsPositive
} from 'class-validator';

export class CallDto {
  @ApiProperty({ description: 'Unique identifier for the call' })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiPropertyOptional({ description: 'Type of call' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  callTypeId?: number;

  @ApiProperty({ description: 'Start time of the call' })
  @IsDateString()
  callStartTime: Date;

  @ApiPropertyOptional({ description: 'Duration of the call in seconds' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  callDuration?: number;

  @ApiPropertyOptional({ description: 'URL associated with the call' })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ description: 'ID of the user who created the call' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  createdBy: number;

  @ApiPropertyOptional({ description: 'ID of the transcription record' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  transcriptionId?: number;

  @ApiPropertyOptional({ description: 'ID of the CRM record' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  crmId?: number;

  @ApiPropertyOptional({ description: 'ID of the summary record' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  summaryId?: number;

  @ApiPropertyOptional({ description: 'ID of the status record' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  statusId?: number;

  @ApiPropertyOptional({ description: 'ID of the queue record' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  queueId?: number;
}

export class CreateCallDto extends CallDto {
  @ApiProperty({ description: 'ID of the user who created the call' })
  @IsInt()
  @IsPositive()
  createdBy: number;
}

export class UpdateCallDto extends PartialType(CallDto) {
  @ApiProperty({ description: 'ID of the user who updated the call' })
  @IsInt()
  @IsPositive()
  updatedBy: number;
}
