import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  OmitType
} from '@nestjs/swagger';
import {
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

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Hotline number' })
  @IsOptional()
  @IsString()
  hotline?: string;

  @ApiPropertyOptional({ description: 'Extension number' })
  @IsOptional()
  @IsInt()
  ext?: number;

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

  @ApiProperty({ description: 'ID of the user who created the call' })
  @IsInt()
  @IsPositive()
  createdBy: number;

  @ApiPropertyOptional({ description: 'ID of the status record' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  statusId?: number;

  @ApiPropertyOptional({ description: 'ID of the type record' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  typeId?: number;

  @ApiPropertyOptional({ description: 'ID of the unit record' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  unitId?: number;
}

export class CreateCallDto extends OmitType(CallDto, ['createdBy'] as const) {
  @ApiPropertyOptional({ description: 'ID of the user who created the call' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  createdBy: number;
}

export class UpdateCallDto extends PartialType(CallDto) {
  @ApiPropertyOptional({ description: 'ID of the user who updated the call' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  updatedBy: number;
}
