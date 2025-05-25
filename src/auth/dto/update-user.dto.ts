import {
  IsEmail,
  IsIn,
  IsString,
  ValidateIf,
  IsOptional
} from 'class-validator';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

import { UserStatusEnum } from 'src/auth/user-status.enum';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

const statusEnumArray = [
  UserStatusEnum.ACTIVE,
  UserStatusEnum.INACTIVE,
  UserStatusEnum.PENDING
];
/**
 * update user data transfer object
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  username: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  @IsString()
  contact: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(statusEnumArray, {
    message: `isIn-{"items":"${statusEnumArray.join(',')}"}`
  })
  status: UserStatusEnum;

  @ApiPropertyOptional()
  @ValidateIf((object, value) => value)
  roleId: number;
}
