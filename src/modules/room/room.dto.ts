import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDecimal
} from 'class-validator';

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  RESERVED = 'RESERVED'
}

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  roomNumber: string;

  @IsDecimal()
  area: number;

  @IsDecimal()
  baseRent: number;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @IsNumber()
  houseId: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsDecimal()
  @IsOptional()
  area?: number;

  @IsDecimal()
  @IsOptional()
  baseRent?: number;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}
