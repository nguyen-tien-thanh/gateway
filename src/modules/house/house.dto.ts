import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  IsInt,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';

export class HouseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  ownerId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalArea: number;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @Type(() => String)
  @IsOptional()
  status?: string;
}

export class CreateHouseDto extends PartialType(HouseDto) {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  createdBy?: number;
}

export class UpdateHouseDto extends PartialType(HouseDto) {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  updatedBy?: number;
}
