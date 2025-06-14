import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResourceMemberDto {
  @ApiProperty()
  @IsString()
  resource: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  resourceId?: number;

  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  createdBy?: number;
}

export class UpdateResourceMemberDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  resource?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  resourceId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  updatedBy?: number;
}
