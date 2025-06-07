import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAssetCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateAssetCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}
