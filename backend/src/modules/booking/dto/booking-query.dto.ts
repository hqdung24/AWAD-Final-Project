import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsIn,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class BookingListQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsPositive()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by user id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by contact email (user email)',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by contact phone (user phone)',
    example: '0909123456',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Filter by booking status',
    example: 'paid',
  })
  @IsOptional()
  @IsIn(['pending', 'paid', 'cancelled', 'expired'])
  status?: string;

  @ApiPropertyOptional({
    description: 'From date (YYYY-MM-DD)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({
    description: 'To date (YYYY-MM-DD)',
    example: '2025-01-31',
  })
  @IsOptional()
  @IsString()
  to?: string;
}
