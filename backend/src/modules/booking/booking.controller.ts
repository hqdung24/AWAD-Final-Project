import { Auth } from '@/modules/auth/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/enums/auth-type.enum';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
  BookingListItemDto,
  UpdateBookingDto,
} from './dto';
import { UpdateSeatsDto } from './dto/update-seats.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  private mapRoutePointSelection(
    routePoints:
      | Array<{
          id: string;
          type: string;
          name: string;
          address: string;
          orderIndex: number;
        }>
      | undefined,
    id: string | null,
  ) {
    if (!routePoints || !id) return null;
    const match = routePoints.find((rp) => rp.id === id);
    if (!match) return null;
    return {
      id: match.id,
      type: match.type,
      name: match.name,
      address: match.address,
      orderIndex: match.orderIndex,
    };
  }

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
      createBookingDto.pickupPointId,
      createBookingDto.dropoffPointId,
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
      pickupPoint: null,
      dropoffPoint: null,
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
      pickupPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.pickupPointId,
      ),
      dropoffPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.dropoffPointId,
      ),
      id: booking.id,
      tripId: booking.tripId,
      userId: booking.userId,
      bookingReference: booking.bookingReference || null,
      status: booking.status,
      totalAmount: Number(booking.totalAmount),
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
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
    type: BookingListItemDto,
  })
  async getBookingDetail(@Param('id') id: string) {
    const booking = await this.bookingService.getBookingDetail(id);

    const bookingDetail = {
      pickupPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.pickupPointId,
      ),
      dropoffPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.dropoffPointId,
      ),
      bookingId: booking.id,
      tripId: booking.tripId,
      userId: booking.userId,
      bookingReference: booking.bookingReference || null,
      status: booking.status,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      ticketVerifyUrl: booking.ticketVerifyUrl,
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
      createdAt: booking.bookedAt.toISOString(),
    };
    return bookingDetail;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update booking contact or passenger info' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @ApiBody({ type: UpdateBookingDto })
  @ApiResponse({
    status: 200,
    description: 'Booking updated',
    type: BookingListItemDto,
  })
  @Auth(AuthType.None) // adjust if you want auth
  async updateBooking(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    const booking = await this.bookingService.updateBooking(id, dto);

    return {
      pickupPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.pickupPointId,
      ),
      dropoffPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.dropoffPointId,
      ),
      bookingId: booking.id,
      tripId: booking.tripId,
      userId: booking.userId,
      bookingReference: booking.bookingReference || null,
      status: booking.status,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
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
      createdAt: booking.bookedAt.toISOString(),
    };
  }

  @Patch(':id/seats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change seats for a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @ApiBody({ type: UpdateSeatsDto })
  @ApiResponse({
    status: 200,
    description: 'Seats updated',
    type: BookingListItemDto,
  })
  @Auth(AuthType.None)
  async changeSeats(@Param('id') id: string, @Body() dto: UpdateSeatsDto) {
    const booking = await this.bookingService.changeSeats(id, dto);

    return {
      pickupPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.pickupPointId,
      ),
      dropoffPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.dropoffPointId,
      ),
      bookingId: booking.id,
      tripId: booking.tripId,
      userId: booking.userId,
      bookingReference: booking.bookingReference || null,
      status: booking.status,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
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
      createdAt: booking.bookedAt.toISOString(),
    };
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None) // Public access
  @ApiOperation({ summary: 'Cancel a pending booking (soft delete)' })
  @ApiParam({ name: 'id', description: 'Booking ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Booking cancelled',
    type: BookingListItemDto,
  })
  async cancelBooking(@Param('id') id: string) {
    const booking = await this.bookingService.cancelBooking(id);

    return {
      pickupPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.pickupPointId,
      ),
      dropoffPoint: this.mapRoutePointSelection(
        booking.trip?.route?.routePoints,
        booking.dropoffPointId,
      ),
      bookingId: booking.id,
      tripId: booking.tripId,
      userId: booking.userId,
      bookingReference: booking.bookingReference || null,
      status: booking.status,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
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
      createdAt: booking.bookedAt.toISOString(),
    };
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update booking status (Admin only)' })
  @Roles(RoleType.ADMIN)
  async updateBookingStatus(
    @Param('id') id: string,
    @Body() payload: UpdateBookingStatusDto,
  ) {
    const updated = await this.bookingService.updateBookingStatus(
      id,
      payload.status,
    );
    if (!updated) {
      throw new BadRequestException('Booking not found');
    }
    return { bookingId: updated.id, status: updated.status };
  }
}
