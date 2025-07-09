import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsObject
} from 'class-validator';

export class TranscriptionDto {
  @ApiProperty({ description: 'Unique identifier for the transcription' })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ description: 'Call ID associated with this transcription' })
  @IsInt()
  @IsPositive()
  callId: number;

  @ApiPropertyOptional({ description: 'Transcription text' })
  @IsOptional()
  @IsString()
  transcription?: string;

  @ApiPropertyOptional({ description: 'Transcription marked as JSON object' })
  @IsOptional()
  @IsObject()
  transcriptionMarked?: any;
}

export class CreateTranscriptionDto {
  @ApiProperty({ description: 'Call ID associated with this transcription' })
  @IsInt()
  @IsPositive()
  callId: number;

  @ApiPropertyOptional({ description: 'Transcription text' })
  @IsOptional()
  @IsString()
  transcription?: string;

  @ApiPropertyOptional({ description: 'Transcription marked as JSON object' })
  @IsOptional()
  @IsObject()
  transcriptionMarked?: any;
}

export class UpdateTranscriptionDto extends PartialType(
  CreateTranscriptionDto
) {}
