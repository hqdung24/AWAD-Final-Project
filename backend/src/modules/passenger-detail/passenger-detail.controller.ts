import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { PassengerDetailService } from './passenger-detail.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

@ApiTags('Admin - Passengers')
@Controller('admin/trips')
export class PassengerDetailController {
  constructor(
    private readonly passengerDetailService: PassengerDetailService,
  ) {}

  @Get(':tripId/passengers')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List passengers by trip' })
  async listPassengers(@Param('tripId') tripId: string) {
    const passengers =
      await this.passengerDetailService.listPassengersByTrip(tripId);

    return passengers.map((passenger) => ({
      id: passenger.id,
      fullName: passenger.fullName,
      documentId: passenger.documentId,
      seatCode: passenger.seatCode,
      checkedInAt: passenger.checkedInAt,
      booking: passenger.booking
        ? {
            id: passenger.booking.id,
            bookingReference: passenger.booking.bookingReference,
            status: passenger.booking.status,
            name: passenger.booking.name,
            email: passenger.booking.email,
            phone: passenger.booking.phone,
          }
        : undefined,
      trip: passenger.booking?.trip
        ? {
            id: passenger.booking.trip.id,
            origin: passenger.booking.trip.route?.origin,
            destination: passenger.booking.trip.route?.destination,
            departureTime: passenger.booking.trip.departureTime,
            arrivalTime: passenger.booking.trip.arrivalTime,
          }
        : undefined,
    }));
  }

  @Patch(':tripId/passengers/:passengerId/check-in')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check-in passenger' })
  async checkInPassenger(
    @Param('tripId') tripId: string,
    @Param('passengerId') passengerId: string,
  ) {
    const passenger = await this.passengerDetailService.checkInPassenger(
      tripId,
      passengerId,
    );

    return {
      id: passenger?.id,
      checkedInAt: passenger?.checkedInAt,
    };
  }

  @Patch(':tripId/passengers/:passengerId/check-in/reset')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset passenger check-in' })
  async resetCheckIn(
    @Param('tripId') tripId: string,
    @Param('passengerId') passengerId: string,
  ) {
    const passenger = await this.passengerDetailService.resetCheckIn(
      tripId,
      passengerId,
    );

    return {
      id: passenger?.id,
      checkedInAt: passenger?.checkedInAt,
    };
  }
}
