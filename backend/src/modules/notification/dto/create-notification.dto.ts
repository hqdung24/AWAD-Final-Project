import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { NotificationType } from '../enums/notification.enum';

export class TripReminderPayloadDto {
  @ApiProperty({ description: 'Trip identifier', example: 'trip_123' })
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({
    description: 'Departure time in ISO format',
    example: '2024-06-01T09:00:00.000Z',
  })
  @IsDateString()
  departureTime: string;

  @ApiProperty({ description: 'Origin location', example: 'Hanoi' })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({ description: 'Destination location', example: 'Da Nang' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Optional booking id', required: false })
  @IsOptional()
  @IsString()
  bookingId?: string;

  @ApiProperty({ description: 'Selected seat codes', type: [String] })
  @IsArray()
  @IsString({ each: true })
  seats: string[];
}

export class TripLiveUpdatePayloadDto {
  @ApiProperty({ description: 'Trip identifier', example: 'trip_123' })
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({ description: 'Readable update message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Optional booking id', required: false })
  @IsOptional()
  @IsString()
  bookingId?: string;
}

export class BookingConfirmationPayloadDto {
  @ApiProperty({ description: 'Booking identifier', example: 'booking_123' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ description: 'Trip identifier', example: 'trip_123' })
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({ description: 'Booking reference', example: 'booking_123' })
  @IsString()
  @IsNotEmpty()
  bookingRef: string;

  @ApiProperty({ description: 'Total amount charged', example: 250000 })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'Currency code', example: 'VND' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Seat codes for the booking', type: [String] })
  @IsArray()
  @IsString({ each: true })
  seats: string[];

  @ApiProperty({
    description: 'Departure time in ISO format',
    example: '2024-06-01T09:00:00.000Z',
  })
  @IsDateString()
  departureTime: string;
}

export class BookingIncompletePayloadDto {
  @ApiProperty({ description: 'Booking identifier', example: 'booking_123' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ description: 'Trip identifier', example: 'trip_123' })
  @IsString()
  @IsNotEmpty()
  tripId: string;

  @ApiProperty({ description: 'Booking ref', example: 'booking_123' })
  @IsString()
  @IsNotEmpty()
  bookingRef: string;

  @ApiProperty({
    description: 'Link to resume checkout',
    example: 'https://example.com/bookings/booking_123/resume',
  })
  @IsUrl()
  resumeUrl: string;

  @ApiProperty({ description: 'Booking status', type: [String] })
  @IsString()
  @IsNotEmpty()
  bookingStatus: string;

  @ApiProperty({ description: 'When the incomplete booking expires' })
  @IsDateString()
  expiresAt: string;
}

export type NotificationPayloadSchema = {
  [NotificationType.TRIP_REMINDER_24H]: TripReminderPayloadDto;
  [NotificationType.TRIP_REMINDER_3H]: TripReminderPayloadDto;
  [NotificationType.TRIP_LIVE_UPDATE]: TripLiveUpdatePayloadDto;
  [NotificationType.BOOKING_CONFIRMATION]: BookingConfirmationPayloadDto;
  [NotificationType.BOOKING_INCOMPLETE]: BookingIncompletePayloadDto;
};
