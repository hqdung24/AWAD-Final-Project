import { ApiProperty } from '@nestjs/swagger';

export class SeatInfoDto {
  @ApiProperty({
    description: 'UUID of the seat',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  seatId: string;

  @ApiProperty({
    description: 'Seat code (e.g., A1, B2)',
    example: 'A1',
  })
  seatCode: string;
}

export class PassengerInfoDto {
  @ApiProperty({
    description: 'Full name of the passenger',
    example: 'Nguyen Van A',
  })
  fullName: string;

  @ApiProperty({
    description: 'Document ID (CMND/CCCD)',
    example: '0123456789',
  })
  documentId: string;

  @ApiProperty({
    description: 'Seat code assigned to passenger',
    example: 'A1',
  })
  seatCode: string;

  @ApiProperty({
    description: 'Phone number (if provided)',
    example: '0909123456',
    required: false,
  })
  phone?: string;
}

export class CreateBookingSuccessResponseDto {
  @ApiProperty({
    description: 'UUID of the created booking',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  bookingId: string;

  @ApiProperty({
    description: 'UUID of the trip',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tripId: string;

  @ApiProperty({
    description: 'Booking status',
    example: 'pending',
    enum: ['pending', 'paid', 'cancelled', 'expired'],
  })
  status: string;

  @ApiProperty({
    description: 'Array of booked seats',
    type: [SeatInfoDto],
  })
  seats: SeatInfoDto[];

  @ApiProperty({
    description: 'Array of passenger details',
    type: [PassengerInfoDto],
  })
  passengers: PassengerInfoDto[];

  @ApiProperty({
    description: 'Total amount to be paid',
    example: 300000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Payment method ID (if provided)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  paymentMethodId?: string;

  @ApiProperty({
    description: 'Timestamp when booking was created',
    example: '2025-12-06T12:30:00.000Z',
  })
  createdAt: string;
}

export class CreateBookingErrorResponseDto {
  @ApiProperty({
    description: 'Error message describing what went wrong',
    examples: [
      'Invalid or expired lock token',
      'Seat is locked or booked',
      'Number of passengers must match number of seats',
      'Passenger seatCode does not match requested seat',
    ],
  })
  message: string;

  @ApiProperty({
    description: 'Additional error details (e.g., seat code that failed)',
    example: 'A1',
    required: false,
  })
  seat?: string;

  @ApiProperty({
    description: 'Error code for programmatic handling',
    examples: [
      'INVALID_TOKEN',
      'TOKEN_EXPIRED',
      'SEAT_UNAVAILABLE',
      'PASSENGER_MISMATCH',
      'SEAT_CODE_MISMATCH',
    ],
    required: false,
  })
  code?: string;
}
