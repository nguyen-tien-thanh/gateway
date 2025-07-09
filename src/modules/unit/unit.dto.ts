import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsPositive } from 'class-validator';

export class UnitDto {
  @ApiProperty({ description: 'Unique identifier for the unit' })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ description: 'Title of the unit' })
  @IsString()
  title: string;
}

export class CreateUnitDto {
  @ApiProperty({ description: 'Title of the unit' })
  @IsString()
  title: string;
}

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}
