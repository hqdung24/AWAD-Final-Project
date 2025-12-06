import { ApiProperty } from '@nestjs/swagger';

export class LockSeatsSuccessResponseDto {
  @ApiProperty({
    description: 'Success flag',
    example: true,
  })
  success: true;

  @ApiProperty({
    description: 'Trip ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  tripId: string;

  @ApiProperty({
    description: 'Array of locked seat IDs',
    type: [String],
    example: ['seat-id-1', 'seat-id-2'],
  })
  seatIds: string[];

  @ApiProperty({
    description: 'ISO timestamp until which seats are locked',
    example: '2025-02-20T09:30:00Z',
  })
  lockedUntil: string;

  @ApiProperty({
    description: 'JWT token to use for subsequent booking operations',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  lockToken: string;
}

export class LockSeatsErrorResponseDto {
  @ApiProperty({
    description: 'Success flag',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Error code',
    enum: [
      'TRIP_NOT_FOUND',
      'TRIP_UNAVAILABLE',
      'INVALID_SEAT',
      'SEAT_LOCKED',
      'SEAT_BOOKED',
      'SEAT_NOT_FOUND',
    ],
    example: 'SEAT_LOCKED',
  })
  error: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Seat is already locked by another user',
  })
  message?: string;

  @ApiProperty({
    description: 'ID of the problematic seat (if applicable)',
    example: 'seat-id-x',
    required: false,
  })
  seat?: string;

  @ApiProperty({
    description: 'Locked until timestamp (if seat is locked)',
    example: '2025-02-20T09:25:00Z',
    required: false,
  })
  lockedUntil?: string;
}
