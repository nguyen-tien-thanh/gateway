import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * create permission data transform object
 */
export class CreatePermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3, {
    message: 'minLength-{"ln":3,"count":3}'
  })
  @MaxLength(50, {
    message: 'maxLength-{"ln":50,"count":50}'
  })
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(10, {
    message: 'minLength-{"ln":10,"count":10}'
  })
  @MaxLength(200, {
    message: 'maxLength-{"ln":200,"count":200}'
  })
  description: string;
}
