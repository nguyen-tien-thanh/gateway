import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsInt, IsPositive } from 'class-validator';

export class StatusDto {
  @ApiProperty({ description: 'Unique identifier for the status' })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ description: 'Title of the status' })
  @IsString()
  title: string;
}

export class CreateStatusDto {
  @ApiProperty({ description: 'Title of the status' })
  @IsString()
  title: string;
}

export class UpdateStatusDto extends PartialType(CreateStatusDto) {}
