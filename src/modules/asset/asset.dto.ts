import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

enum AssetCondition {
  NEW = 'NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED'
}

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsNumber()
  categoryId: number;

  @IsEnum(AssetCondition)
  condition: AssetCondition;

  @IsNumber()
  value: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}
