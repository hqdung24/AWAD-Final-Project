import { ApiProperty } from '@nestjs/swagger';
import {
  SeatInfoDto,
  PassengerInfoDto,
  RoutePointSelectionDto,
} from './booking-response.dto';

export class TripBriefDto {
  @ApiProperty({
    description: 'Trip ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ description: 'Route ID', example: 'route-id-123' })
  routeId: string;

  @ApiProperty({ description: 'Route origin', example: 'Hanoi' })
  origin: string;

  @ApiProperty({ description: 'Route destination', example: 'Saigon' })
  destination: string;

  @ApiProperty({ description: 'Bus ID', example: 'bus-id-123' })
  busId: string;

  @ApiProperty({
    description: 'Departure time',
    example: '2025-12-06T10:00:00.000Z',
  })
  departureTime: string;

  @ApiProperty({
    description: 'Arrival time',
    example: '2025-12-06T14:00:00.000Z',
  })
  arrivalTime: string;

  @ApiProperty({ description: 'Trip base price', example: 200000 })
  basePrice: number;

  @ApiProperty({ description: 'Trip status', example: 'scheduled' })
  status: string;
}

export class BookingListItemDto {
  @ApiProperty({
    description: 'Booking ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Trip ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tripId: string;

  @ApiProperty({
    description: 'User ID (nullable)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  userId: string | null;

  @ApiProperty({
    description: 'Booking reference (if any)',
    example: 'BR123456789',
    nullable: true,
  })
  bookingReference: string | null;

  @ApiProperty({
    description: 'Status',
    example: 'pending',
    enum: ['pending', 'paid', 'cancelled', 'expired'],
  })
  status: string;

  @ApiProperty({ description: 'Total amount', example: 300000 })
  totalAmount: number;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2025-12-06T12:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Name of the person who made the booking',
    example: 'John Doe',
  })
  name: string;
  @ApiProperty({
    description: 'Email of the person who made the booking',
    example: 'd@example.com',
  })
  email: string;
  @ApiProperty({
    description: 'Phone number of the person who made the booking',
    example: '+1234567890',
  })
  phone: string;

  @ApiProperty({ description: 'Trip information', type: TripBriefDto })
  trip: TripBriefDto;

  @ApiProperty({ description: 'Seats in the booking', type: [SeatInfoDto] })
  seats: SeatInfoDto[];

  @ApiProperty({
    description: 'Passengers in the booking',
    type: [PassengerInfoDto],
  })
  passengers: PassengerInfoDto[];

  @ApiProperty({
    description: 'Selected pickup point (if any)',
    type: RoutePointSelectionDto,
    required: false,
    nullable: true,
  })
  pickupPoint?: RoutePointSelectionDto | null;

  @ApiProperty({
    description: 'Selected dropoff point (if any)',
    type: RoutePointSelectionDto,
    required: false,
    nullable: true,
  })
  dropoffPoint?: RoutePointSelectionDto | null;
}

export class BookingListResponseDto {
  @ApiProperty({ description: 'List of bookings', type: [BookingListItemDto] })
  data: BookingListItemDto[];

  @ApiProperty({ description: 'Total items', example: 42 })
  total: number;

  @ApiProperty({ description: 'Current page (1-based)', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;
}
