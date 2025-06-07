import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoomAssetDto {
  @IsNumber()
  roomId: number;

  @IsNumber()
  assetId: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateRoomAssetDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}
