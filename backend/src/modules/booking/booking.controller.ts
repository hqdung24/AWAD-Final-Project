import { Auth } from '@/modules/auth/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/enums/auth-type.enum';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  CreateBookingErrorResponseDto,
  CreateBookingSuccessResponseDto,
} from './dto';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Auth(AuthType.None) // Public access - can add user auth later
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new booking',
    description:
      'Create a booking using a valid lock token. ' +
      'The lock token must be obtained from the seat lock endpoint first. ' +
      'Validates seat availability, passenger data, and creates booking atomically. ' +
      'All seats will be marked as booked and lock will be released.',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    type: CreateBookingSuccessResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token, validation error, or seat code mismatch',
    type: CreateBookingErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Trip not found or seats not found',
    type: CreateBookingErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Seat locked by another user, already booked, or lock expired',
    type: CreateBookingErrorResponseDto,
  })
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    const result = await this.bookingService.createBooking(
      createBookingDto.lockToken,
      createBookingDto.passengers,
      createBookingDto.contactInfo,
      createBookingDto.paymentMethodId,
    );

    return {
      bookingId: result.booking.id,
      tripId: result.booking.tripId,
      status: result.booking.status,
      seats: result.seats,
      passengers: result.passengers.map((p) => ({
        fullName: p.fullName,
        documentId: p.documentId,
        seatCode: p.seatCode,
      })),
      totalAmount: Number(result.booking.totalAmount),
      paymentMethodId: createBookingDto.paymentMethodId, //not implemented yet, return from request for now
      createdAt: result.booking.bookedAt.toISOString(),
    };
  }
}
