import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class TripService {
  constructor(
    private readonly tripRepository: TripRepository,
    private readonly tripValidationProvider: TripValidationProvider,
    private readonly seatStatusGenerator: SeatStatusGeneratorProvider,
    private readonly seatStatusService: SeatStatusService,
    private readonly mediaService: MediaService,
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

    const busChanged = Boolean(updateTripDto.busId) && updateTripDto.busId !== existingTrip.busId;

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

    // If bus changed, regenerate seat statuses for the new bus
    if (busChanged && updatedTrip) {
      await this.seatStatusService.deleteByTripId(id);
      await this.seatStatusGenerator.generateSeatStatusesForTrip(
        id,
        updatedTrip.busId,
      );
    }
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
    return updatedTrip!; // ensure exists
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
            name: rp.name,
            address: rp.address,
            note: rp.address,
          })) || [],
      dropoff:
        trip.route?.routePoints
          ?.filter((rp) => rp.type === 'dropoff')
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((rp) => ({
            name: rp.name,
            address: rp.address,
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
      busPhotos: busPhotos.map((media) => media.url),
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
