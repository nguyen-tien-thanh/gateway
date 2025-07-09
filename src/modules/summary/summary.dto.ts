import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsJSON,
  IsObject
} from 'class-validator';

export class SummaryDto {
  @ApiProperty({ description: 'Unique identifier for the summary' })
  @IsInt()
  @IsPositive()
  id: number;

  @ApiProperty({ description: 'Call ID associated with this summary' })
  @IsInt()
  @IsPositive()
  callId: number;

  @ApiPropertyOptional({ description: 'Steps as JSON object' })
  @IsOptional()
  @IsObject()
  steps?: any;

  @ApiPropertyOptional({ description: 'Call topic' })
  @IsOptional()
  @IsString()
  callTopic?: string;

  @ApiPropertyOptional({ description: 'Call summary' })
  @IsOptional()
  @IsString()
  callSummary?: string;

  @ApiPropertyOptional({ description: 'Product category' })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'Agent attitude score' })
  @IsOptional()
  @IsInt()
  agentAttitude?: number;

  @ApiPropertyOptional({ description: 'Agent overall score' })
  @IsOptional()
  @IsInt()
  agentOverallScore?: number;

  @ApiPropertyOptional({ description: 'Customer sentiment score' })
  @IsOptional()
  @IsInt()
  custSentiment?: number;

  @ApiPropertyOptional({ description: 'Customer experience score' })
  @IsOptional()
  @IsInt()
  custExperience?: number;

  @ApiPropertyOptional({ description: 'Overall outcome' })
  @IsOptional()
  @IsString()
  overallOutcome?: string;
}

export class CreateSummaryDto {
  @ApiProperty({ description: 'Call ID associated with this summary' })
  @IsInt()
  @IsPositive()
  callId: number;

  @ApiPropertyOptional({ description: 'Steps as JSON object' })
  @IsOptional()
  @IsObject()
  steps?: any;

  @ApiPropertyOptional({ description: 'Call topic' })
  @IsOptional()
  @IsString()
  callTopic?: string;

  @ApiPropertyOptional({ description: 'Call summary' })
  @IsOptional()
  @IsString()
  callSummary?: string;

  @ApiPropertyOptional({ description: 'Product category' })
  @IsOptional()
  @IsString()
  productCategory?: string;

  @ApiPropertyOptional({ description: 'Product name' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ description: 'Agent attitude score' })
  @IsOptional()
  @IsInt()
  agentAttitude?: number;

  @ApiPropertyOptional({ description: 'Agent overall score' })
  @IsOptional()
  @IsInt()
  agentOverallScore?: number;

  @ApiPropertyOptional({ description: 'Customer sentiment score' })
  @IsOptional()
  @IsInt()
  custSentiment?: number;

  @ApiPropertyOptional({ description: 'Customer experience score' })
  @IsOptional()
  @IsInt()
  custExperience?: number;

  @ApiPropertyOptional({ description: 'Overall outcome' })
  @IsOptional()
  @IsString()
  overallOutcome?: string;
}

export class UpdateSummaryDto extends PartialType(CreateSummaryDto) {}
