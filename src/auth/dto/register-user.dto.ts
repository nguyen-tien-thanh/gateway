import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * register user data transform object
 */
export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'minLength-{"ln":6,"count":6}'
  })
  @MaxLength(20, {
    message: 'maxLength-{"ln":20,"count":20}'
  })
  @Matches(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{6,20}$/,
    {
      message:
        'password should contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character'
    }
  )
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
