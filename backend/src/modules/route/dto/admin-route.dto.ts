import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RouteQueryDto {
  @ApiPropertyOptional({ description: 'Filter by operator ID' })
  @IsOptional()
  @IsString()
  operatorId?: string;

  @ApiPropertyOptional({ description: 'Filter by active status', default: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 100, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 100;
}

export class CreateRouteDto {
  @ApiProperty({ description: 'Operator ID' })
  @IsString()
  operatorId: string;

  @ApiProperty({ description: 'Origin city' })
  @IsString()
  origin: string;

  @ApiProperty({ description: 'Destination city' })
  @IsString()
  destination: string;

  @ApiProperty({ description: 'Distance in kilometers' })
  @Type(() => Number)
  @IsNumber()
  distanceKm: number;

  @ApiProperty({ description: 'Estimated duration in minutes' })
  @Type(() => Number)
  @IsNumber()
  estimatedMinutes: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateRouteDto {
  @ApiPropertyOptional({ description: 'Operator ID' })
  @IsOptional()
  @IsString()
  operatorId?: string;

  @ApiPropertyOptional({ description: 'Origin city' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ description: 'Destination city' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ description: 'Distance in kilometers' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  distanceKm?: number;

  @ApiPropertyOptional({ description: 'Estimated duration in minutes' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  estimatedMinutes?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
