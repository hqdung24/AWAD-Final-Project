import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum TripSortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  TIME_ASC = 'time_asc',
  TIME_DESC = 'time_desc',
  DURATION_ASC = 'duration_asc',
  DURATION_DESC = 'duration_desc',
}

export enum TimeSlot {
  MORNING = 'morning', // 06:00 - 12:00
  AFTERNOON = 'afternoon', // 12:00 - 18:00
  EVENING = 'evening', // 18:00 - 00:00
  NIGHT = 'night', // 00:00 - 06:00
}

export class SearchTripQueryDto {
  @ApiPropertyOptional({
    description: 'Origin city (must match route origin exactly)',
    example: 'Ho Chi Minh City',
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({
    description: 'Destination city (must match route destination exactly)',
    example: 'Hanoi',
  })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({
    description:
      'Departure date (returns trips from this date onwards, format: YYYY-MM-DD)',
    example: '2025-12-03',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Number of passengers (for checking available seats)',
    example: 1,
    minimum: 1,
    maximum: 50,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  passengers?: number = 1;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 500000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by departure time slots (comma-separated)',
    example: 'morning,afternoon',
    enum: TimeSlot,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value as string[];
  })
  @IsArray()
  @IsEnum(TimeSlot, { each: true })
  timeSlots?: TimeSlot[];

  @ApiPropertyOptional({
    description: 'Filter by bus types (comma-separated)',
    example: 'standard,premium',
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value as string[];
  })
  @IsArray()
  @IsString({ each: true })
  busTypes?: string[];

  @ApiPropertyOptional({
    description:
      'Filter by required amenities (comma-separated, trip must have ALL specified amenities)',
    example: 'wifi,air_conditioner',
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value as string[];
  })
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({
    description: 'Sort results by',
    enum: TripSortBy,
    default: TripSortBy.PRICE_ASC,
    example: TripSortBy.PRICE_ASC,
  })
  @IsOptional()
  @IsEnum(TripSortBy)
  sortBy?: TripSortBy = TripSortBy.PRICE_ASC;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
