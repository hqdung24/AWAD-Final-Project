import { Auth } from '@/modules/auth/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/enums/auth-type.enum';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import {
  CreateBookingDto,
  CreateBookingErrorResponseDto,
  CreateBookingSuccessResponseDto,
  BookingListQueryDto,
  BookingListResponseDto,
} from './dto';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Auth(AuthType.None) // Public access
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
      createBookingDto.userId,
    );

    return {
      bookingId: result.booking.id,
      tripId: result.booking.tripId,
      status: result.booking.status,
      seats: result.seats,
      userId: result.booking.userId,
      bookingReference: result.booking.bookingReference,
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

  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None) // Public access
  @ApiOperation({ summary: 'Get list of bookings (filterable)' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user id',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter by user email',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    description: 'Filter by user phone',
  })
  @ApiResponse({
    status: 200,
    description: 'List bookings',
    type: BookingListResponseDto,
  })
  async listBookings(@Query() query: BookingListQueryDto) {
    const { data, total } = await this.bookingService.listBookings(query);

    const items = data.map((booking) => ({
      id: booking.id,
      tripId: booking.tripId,
      userId: booking.userId,
      bookingReference: booking.bookingReference || null,
      status: booking.status,
      totalAmount: Number(booking.totalAmount),
      createdAt: booking.bookedAt.toISOString(),
      trip: booking.trip
        ? {
            id: booking.trip.id,
            routeId: booking.trip.routeId,
            origin: booking.trip.route?.origin,
            destination: booking.trip.route?.destination,
            busId: booking.trip.busId,
            departureTime: booking.trip.departureTime.toISOString(),
            arrivalTime: booking.trip.arrivalTime.toISOString(),
            basePrice: Number(booking.trip.basePrice),
            status: booking.trip.status,
          }
        : undefined,
      seats: (booking.seatStatuses || []).map((ss) => ({
        seatId: ss.seatId,
        seatCode: ss.seat?.seatCode,
      })),
      passengers: (booking.passengerDetails || []).map((p) => ({
        fullName: p.fullName,
        documentId: p.documentId,
        seatCode: p.seatCode,
      })),
    }));

    return {
      data: items,
      total,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get booking details by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @Auth(AuthType.None) // Public access
  @ApiResponse({
    status: 200,
    description: 'Booking details',
    type: BookingListResponseDto,
  })
  async getBookingDetail(@Param('id') id: string) {
    const booking = await this.bookingService.getBookingDetail(id);

    return {
      bookingId: booking.id,
      tripId: booking.tripId,
      userId: booking.userId,
      bookingReference: booking.bookingReference || null,
      status: booking.status,
      trip: booking.trip
        ? {
            id: booking.trip.id,
            routeId: booking.trip.routeId,
            origin: booking.trip.route?.origin,
            destination: booking.trip.route?.destination,
            busId: booking.trip.busId,
            departureTime: booking.trip.departureTime.toISOString(),
            arrivalTime: booking.trip.arrivalTime.toISOString(),
            basePrice: Number(booking.trip.basePrice),
            status: booking.trip.status,
          }
        : undefined,
      seats: (booking.seatStatuses || []).map((ss) => ({
        seatId: ss.seatId,
        seatCode: ss.seat?.seatCode,
      })),
      passengers: (booking.passengerDetails || []).map((p) => ({
        fullName: p.fullName,
        documentId: p.documentId,
        seatCode: p.seatCode,
      })),
      totalAmount: Number(booking.totalAmount),
      paymentMethodId: undefined,
      createdAt: booking.bookedAt.toISOString(),
    };
  }
}
