import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

enum TripStatus {
  SCHEDULED = 'scheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

enum TripSortBy {
  DEPARTURE_TIME = 'departureTime',
  ARRIVAL_TIME = 'arrivalTime',
  BASE_PRICE = 'basePrice',
  BOOKINGS = 'bookings',
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class TripQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by route ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  routeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by bus ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsString()
  busId?: string;

  @ApiPropertyOptional({
    description: 'Filter by trip status',
    enum: TripStatus,
    example: TripStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
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
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: TripSortBy,
    example: TripSortBy.DEPARTURE_TIME,
  })
  @IsOptional()
  @IsEnum(TripSortBy)
  sortBy?: TripSortBy;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
