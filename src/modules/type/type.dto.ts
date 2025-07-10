import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsInt, IsPositive } from 'class-validator';

export class TypeDto {
  @ApiProperty({ description: 'Unique identifier for the type' })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ description: 'Title of the type' })
  @IsString()
  title: string;
}

export class CreateTypeDto {
  @ApiProperty({ description: 'Title of the type' })
  @IsString()
  title: string;
}

export class UpdateTypeDto extends PartialType(CreateTypeDto) {}
