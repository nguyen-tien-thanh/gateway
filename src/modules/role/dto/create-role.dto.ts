import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(2, {
    message: 'minLength-{"ln":2,"count":2}'
  })
  @MaxLength(100, {
    message: 'maxLength-{"ln":100,"count":100}'
  })
  name: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsNumber(
    {},
    {
      each: true,
      message: 'should be array of numbers'
    }
  )
  permissions: number[];
}
