import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsInt, IsPositive } from 'class-validator';

export class CallTypeDto {
  @ApiProperty({ description: 'Unique identifier for the call type' })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ description: 'Title of the call type' })
  @IsString()
  title: string;
}

export class CreateCallTypeDto {
  @ApiProperty({ description: 'Title of the call type' })
  @IsString()
  title: string;
}

export class UpdateCallTypeDto extends PartialType(CreateCallTypeDto) {}
