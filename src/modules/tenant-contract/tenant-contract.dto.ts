import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate
} from 'class-validator';

export enum ContractStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
  PENDING = 'PENDING'
}

export class CreateTenantContractDto {
  @IsNumber()
  tenantId: number;

  @IsNumber()
  roomId: number;

  @IsNumber()
  monthlyRent: number;

  @IsNumber()
  deposit: number;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateTenantContractDto {
  @IsNumber()
  @IsOptional()
  monthlyRent?: number;

  @IsNumber()
  @IsOptional()
  deposit?: number;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}
