import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber
} from 'class-validator';

enum EntityType {
  HOUSE = 'HOUSE',
  ROOM = 'ROOM',
  ASSET = 'ASSET',
  MAINTENANCE = 'MAINTENANCE',
  TENANT_CONTRACT = 'TENANT_CONTRACT'
}

export class CreateImageDto {
  @IsString()
  imageUrl: string;

  @IsEnum(EntityType)
  entityType: EntityType;

  @IsNumber()
  entityId: number;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateImageDto {
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}
