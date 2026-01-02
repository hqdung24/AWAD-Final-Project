import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TripRepository } from './trip.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { Trip } from './entities/trip.entity';
import { TripValidationProvider } from './providers/trip-validation.provider';
import { SeatStatusGeneratorProvider } from './providers/seat-status-generator.provider';
import { SeatStatusService } from '@/modules/seat-status/seat-status.service';
import { MediaService } from '@/modules/media/media.service';
import { MediaDomain } from '@/modules/media/enums/media-domain.enum';
import { MediaType } from '@/modules/media/enums/media-type.enum';
import { NotificationType } from '../notification/enums/notification.enum';
import { BookingRepository } from '@/modules/booking/booking.repository';
import { BookingEmailProvider } from '@/modules/booking/providers/booking-email.provider';

@Injectable()
export class TripService {
  constructor(
    private readonly tripRepository: TripRepository,
    private readonly tripValidationProvider: TripValidationProvider,
    private readonly seatStatusGenerator: SeatStatusGeneratorProvider,
    private readonly seatStatusService: SeatStatusService,
    private readonly mediaService: MediaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly bookingRepository: BookingRepository,
    private readonly bookingEmailProvider: BookingEmailProvider,
  ) {}

  async createTrip(createTripDto: CreateTripDto): Promise<Trip> {
    const { routeId, busId, departureTime, arrivalTime, basePrice } =
      createTripDto;

    // Validate route exists and is active
    await this.tripValidationProvider.validateRouteExists(routeId);

    // Validate bus exists and is active
    await this.tripValidationProvider.validateBusExists(busId);

    // Validate bus scheduling (no conflicts)
    await this.tripValidationProvider.validateBusScheduling(
      busId,
      new Date(departureTime),
      new Date(arrivalTime),
    );

    // Create trip
    const trip = await this.tripRepository.create({
      routeId,
      busId,
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
      basePrice,
      status: 'scheduled',
    });

    // Auto-generate seat statuses for all seats in the bus
    await this.seatStatusGenerator.generateSeatStatusesForTrip(trip.id, busId);

    // Return trip with relations
    const fullTrip = await this.tripRepository.findById(trip.id);
    return fullTrip!; // already exists
  }

  async getTrips(query: TripQueryDto): Promise<{
    data: Trip[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sortBy, sortOrder, ...filters } = query;

    const [trips, total] = await this.tripRepository.findAll({
      ...filters,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return {
      data: trips,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTripById(id: string): Promise<Trip> {
    const trip = await this.tripRepository.findById(id);

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async updateTrip(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    // Check if trip exists
    const existingTrip = await this.getTripById(id);

    const busChanged =
      Boolean(updateTripDto.busId) &&
      updateTripDto.busId !== existingTrip.busId;

    // If updating bus or time, validate scheduling
    if (
      updateTripDto.busId ||
      updateTripDto.departureTime ||
      updateTripDto.arrivalTime
    ) {
      const busId = updateTripDto.busId || existingTrip.busId;
      const departureTime = updateTripDto.departureTime
        ? new Date(updateTripDto.departureTime)
        : existingTrip.departureTime;
      const arrivalTime = updateTripDto.arrivalTime
        ? new Date(updateTripDto.arrivalTime)
        : existingTrip.arrivalTime;

      if (updateTripDto.busId) {
        await this.tripValidationProvider.validateBusExists(busId);
      }

      await this.tripValidationProvider.validateBusScheduling(
        busId,
        departureTime,
        arrivalTime,
        id, // exclude current trip
      );
    }

    // If reactivating a trip, revalidate bus scheduling for the existing time
    if (
      updateTripDto.status === 'scheduled' &&
      existingTrip.status !== 'scheduled' &&
      !updateTripDto.busId &&
      !updateTripDto.departureTime &&
      !updateTripDto.arrivalTime
    ) {
      await this.tripValidationProvider.validateBusExists(existingTrip.busId);
      await this.tripValidationProvider.validateBusScheduling(
        existingTrip.busId,
        existingTrip.departureTime,
        existingTrip.arrivalTime,
        id,
      );
    }

    // If updating route, validate it exists
    if (updateTripDto.routeId) {
      await this.tripValidationProvider.validateRouteExists(
        updateTripDto.routeId,
      );
    }

    // Prepare update data
    const updateData: Partial<Trip> = {};

    if (updateTripDto.routeId) updateData.routeId = updateTripDto.routeId;
    if (updateTripDto.busId) updateData.busId = updateTripDto.busId;
    if (updateTripDto.departureTime)
      updateData.departureTime = new Date(updateTripDto.departureTime);
    if (updateTripDto.arrivalTime)
      updateData.arrivalTime = new Date(updateTripDto.arrivalTime);
    if (updateTripDto.basePrice !== undefined)
      updateData.basePrice = updateTripDto.basePrice;
    if (updateTripDto.status) updateData.status = updateTripDto.status;

    // Update trip
    const updatedTrip = await this.tripRepository.update(id, updateData);
    console.log('🚀 Updated trip: ', updatedTrip?.status); // DEBUG
    // Event emitter to sync upcoming trips for old and new bus if bus changed -----

    // Track status change for events
    const oldStatus = existingTrip.status;
    const newStatus = updateTripDto.status as string;
    const statusChanged = newStatus && newStatus !== oldStatus;
    const shouldRegenerateSeats =
      statusChanged &&
      newStatus === 'scheduled' &&
      (oldStatus === 'archived' || oldStatus === 'cancelled');

    // Emit events if status changed
    if (statusChanged && updatedTrip) {
      // Get all bookings for this trip to notify passengers
      const trip = await this.tripRepository.findBookingsByTripId(id);
      const bookings = trip ? trip.bookings : [];
      console.log('🚀 Updated bookings: ', bookings); // DEBUG
      // Emit event for each user with a booking on this trip
      const validBookings = bookings.filter(
        (b) => b.userId && b.status !== 'cancelled' && b.status !== 'expired',
      );

      for (const booking of validBookings) {
        this.eventEmitter.emit('notification.create', {
          userId: booking.userId,
          type: NotificationType.TRIP_LIVE_UPDATE,
          payload: {
            tripId: id,
            bookingId: booking.id,
            bookingRef: booking.bookingReference,
            message: `Trip status for booking ${booking.bookingReference} has been updated to ${newStatus}`,
          },
        });
      }

      // Emit trip status update event for realtime broadcast
      this.eventEmitter.emit('trip.status.updated', {
        tripId: id,
        oldStatus,
        newStatus,
        trip: updatedTrip,
        timestamp: new Date(),
      });
    }

    // If bus changed, regenerate seat statuses for the new bus
    if (busChanged && updatedTrip) {
      await this.seatStatusService.deleteByTripId(id);
      await this.seatStatusGenerator.generateSeatStatusesForTrip(
        id,
        updatedTrip.busId,
      );
    }

    if (!busChanged && shouldRegenerateSeats && updatedTrip) {
      await this.seatStatusService.deleteByTripId(id);
      await this.seatStatusGenerator.generateSeatStatusesForTrip(
        id,
        updatedTrip.busId,
      );
    }

    //Emit event to sync upcoming trips for old and new bus

    return updatedTrip!; // already exists if updated
  }

  async syncUpcomingTripsForBus(busId: string) {
    const trips = await this.tripRepository.findUpcomingByBusId(busId);
    for (const trip of trips) {
      await this.seatStatusService.deleteByTripId(trip.id);
      await this.seatStatusGenerator.generateSeatStatusesForTrip(
        trip.id,
        trip.busId,
      );
    }
  }

  async cancelTrip(id: string): Promise<Trip> {
    const trip = await this.getTripById(id);

    if (trip.status === 'cancelled') {
      throw new NotFoundException('Trip is already cancelled');
    }

    if (trip.status === 'completed') {
      throw new NotFoundException('Cannot cancel a completed trip');
    }

    const updatedTrip = await this.tripRepository.update(id, {
      status: 'cancelled',
    });

    const cancelledBookings =
      await this.bookingRepository.cancelBookingsByTripIds([id]);

    for (const booking of cancelledBookings) {
      const email = booking.email || booking.user?.email;
      if (!email) continue;

      const seatsFromStatus =
        booking.seatStatuses
          ?.map((ss) => ss.seat?.seatCode)
          .filter((seat): seat is string => Boolean(seat)) ?? [];
      const seatsFromPassengers =
        booking.passengerDetails
          ?.map((passenger) => passenger.seatCode)
          .filter((seat): seat is string => Boolean(seat)) ?? [];
      const seats = seatsFromStatus.length > 0 ? seatsFromStatus : seatsFromPassengers;

      const contactName =
        booking.name ||
        `${booking.user?.firstName ?? ''} ${booking.user?.lastName ?? ''}`.trim();

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.bookingEmailProvider.sendBookingCancelledEmail(email, {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        origin: booking.trip?.route?.origin || '—',
        destination: booking.trip?.route?.destination || '—',
        departureTime: booking.trip?.departureTime?.toISOString?.() || '',
        seats,
        contact: {
          name: contactName || null,
          email,
          phone: booking.phone || null,
        },
        reason: 'Trip cancelled by admin.',
      });
    }
    return updatedTrip!; // ensure exists
  }

  async autoUpdateTripStatuses(now: Date): Promise<{
    cancelled: number;
    completed: number;
    archived: number;
  }> {
    const cancelled =
      await this.tripRepository.markCancelledIfNoSalesOrCheckins(now);
    const completed = await this.tripRepository.markDeparted(now);
    const archived = await this.tripRepository.markArrived(now);
    return { cancelled, completed, archived };
  }

  async searchTrips(filters: {
    from?: string;
    to?: string;
    date?: string;
    passengers?: number;
  }): Promise<any[]> {
    console.log('🚀 TripService.searchTrips called with:', filters);
    const trips = await this.tripRepository.searchTrips(filters);
    console.log(`📦 TripService returning ${trips.length} trips`);

    // Transform trips to include bus and route details
    return trips.map((trip) => {
      const availableSeats =
        trip.seatStatuses?.filter((ss) => ss.state === 'available').length || 0;

      return {
        id: trip.id,
        from: trip.route?.origin || '',
        to: trip.route?.destination || '',
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        duration: this.calculateDuration(trip.departureTime, trip.arrivalTime),
        price: Number(trip.basePrice),
        busType: trip.bus?.busType || 'Standard',
        company: trip.bus?.operator?.name || 'Unknown',
        amenities: this.parseAmenities(trip.bus?.amenitiesJson),
        seatsAvailable: availableSeats,
        busModel: trip.bus?.model,
        plateNumber: trip.bus?.plateNumber,
      };
    });
  }

  async getTripDetails(id: string): Promise<any> {
    const trip = await this.tripRepository.findByIdWithRoutePoints(id);

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    const availableSeats =
      trip.seatStatuses?.filter((ss) => ss.state === 'available').length || 0;

    // Group route points by type
    const routePoints = {
      pickup:
        trip.route?.routePoints
          ?.filter((rp) => rp.type === 'pickup')
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((rp) => ({
            id: rp.id,
            type: rp.type,
            name: rp.name,
            address: rp.address,
            orderIndex: rp.orderIndex,
            note: rp.address,
          })) || [],
      dropoff:
        trip.route?.routePoints
          ?.filter((rp) => rp.type === 'dropoff')
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((rp) => ({
            id: rp.id,
            type: rp.type,
            name: rp.name,
            address: rp.address,
            orderIndex: rp.orderIndex,
            note: rp.address,
          })) || [],
    };

    const busPhotos = trip.busId
      ? await this.mediaService.listMediaByOwner(
          MediaDomain.BUS,
          trip.busId,
          MediaType.BUS_PHOTO,
        )
      : [];

    return {
      id: trip.id,
      from: trip.route?.origin || '',
      to: trip.route?.destination || '',
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      duration: this.calculateDuration(trip.departureTime, trip.arrivalTime),
      price: Number(trip.basePrice),
      busType: trip.bus?.busType || 'Standard',
      company: trip.bus?.operator?.name || 'Unknown',
      amenities: this.parseAmenities(trip.bus?.amenitiesJson),
      seatsAvailable: availableSeats,
      busModel: trip.bus?.model,
      plateNumber: trip.bus?.plateNumber,
      distanceKm: trip.route?.distanceKm,
      busPhotos: busPhotos ? busPhotos.map((media) => media.url) : [],
      routePoints,
    };
  }

  private calculateDuration(departure: Date, arrival: Date): string {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  private parseAmenities(amenitiesJson?: string | null): string[] {
    if (!amenitiesJson) return [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = JSON.parse(amenitiesJson);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
