import {
  IsString,
  IsBoolean,
  IsOptional,
  IsDate,
  IsNumber
} from 'class-validator';

export class CreateQRCodeDto {
  @IsNumber()
  houseId: number;

  @IsString()
  qrData: string;

  @IsString()
  imageUrl: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @IsOptional()
  expiresAt?: Date;

  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateQRCodeDto {
  @IsString()
  @IsOptional()
  qrData?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @IsOptional()
  expiresAt?: Date;

  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}
