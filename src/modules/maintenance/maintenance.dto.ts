import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDecimal,
  IsDate
} from 'class-validator';

enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

enum MaintenanceStatus {
  REPORTED = 'REPORTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class CreateMaintenanceDto {
  @IsNumber()
  roomId: number;

  @IsNumber()
  reportedBy: number;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(MaintenancePriority)
  @IsOptional()
  priority?: MaintenancePriority;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsDecimal()
  @IsOptional()
  cost?: number;

  @IsDate()
  @IsOptional()
  completedAt?: Date;

  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateMaintenanceDto {
  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MaintenancePriority)
  @IsOptional()
  priority?: MaintenancePriority;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsDecimal()
  @IsOptional()
  cost?: number;

  @IsDate()
  @IsOptional()
  completedAt?: Date;

  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}
