import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsDateString,
  IsObject
} from 'class-validator';

export class QueueDto {
  @ApiProperty({ description: 'Unique identifier for the queue' })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ description: 'Call ID associated with this queue' })
  @IsInt()
  @IsPositive()
  callId: number;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'License plate' })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiPropertyOptional({ description: 'Username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Quanlyxe data as JSON object' })
  @IsOptional()
  @IsObject()
  quanlyxe?: any;

  @ApiPropertyOptional({ description: 'CRM data as JSON object' })
  @IsOptional()
  @IsObject()
  crm?: any;

  @ApiProperty({ description: 'Created date' })
  @IsDateString()
  createdDate: Date;

  @ApiProperty({ description: 'ID of the user who created the queue' })
  @IsInt()
  @IsPositive()
  createdBy: number;

  @ApiProperty({ description: 'Updated date' })
  @IsDateString()
  updatedDate: Date;
}

export class CreateQueueDto {
  @ApiProperty({ description: 'Call ID associated with this queue' })
  @IsInt()
  @IsPositive()
  callId: number;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'License plate' })
  @IsOptional()
  @IsString()
  plate?: string;

  @ApiPropertyOptional({ description: 'Username' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Note' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Quanlyxe data as JSON object' })
  @IsOptional()
  @IsObject()
  quanlyxe?: any;

  @ApiPropertyOptional({ description: 'CRM data as JSON object' })
  @IsOptional()
  @IsObject()
  crm?: any;

  @ApiProperty({ description: 'ID of the user who created the queue' })
  @IsInt()
  @IsPositive()
  createdBy: number;
}

export class UpdateQueueDto extends PartialType(CreateQueueDto) {}
