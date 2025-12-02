import { Injectable, NotFoundException } from '@nestjs/common';
import { TripRepository } from './trip.repository';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { Trip } from './entities/trip.entity';
import { TripValidationProvider } from './providers/trip-validation.provider';
import { SeatStatusGeneratorProvider } from './providers/seat-status-generator.provider';

@Injectable()
export class TripService {
  constructor(
    private readonly tripRepository: TripRepository,
    private readonly tripValidationProvider: TripValidationProvider,
    private readonly seatStatusGenerator: SeatStatusGeneratorProvider,
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
    const { page = 1, limit = 10, ...filters } = query;

    const [trips, total] = await this.tripRepository.findAll({
      ...filters,
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
    return updatedTrip!; // already exists if updated
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
}
