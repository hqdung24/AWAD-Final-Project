import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @ApiProperty({
    description: 'Route ID for the trip',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsString()
  routeId: string;

  @ApiProperty({
    description: 'Bus ID for the trip',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty()
  @IsString()
  busId: string;

  @ApiProperty({
    description: 'Departure date and time (ISO 8601 format)',
    example: '2025-12-05T08:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  departureTime: string;

  @ApiProperty({
    description: 'Arrival date and time (ISO 8601 format)',
    example: '2025-12-05T14:30:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  arrivalTime: string;

  @ApiProperty({
    description: 'Base price for the trip in VND',
    example: 250000,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;
}
