import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  resource: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  path: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  method: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
export class CreatePermissionDto extends PermissionDto {}

export class UpdatePermissionDto extends PartialType(PermissionDto) {}
