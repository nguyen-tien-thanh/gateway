import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

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
  //   @IsNotEmpty()
  @IsBoolean()
  isDefault: boolean;
}
export class CreatePermissionDto extends PermissionDto {}

export class UpdatePermissionDto extends PartialType(PermissionDto) {}
