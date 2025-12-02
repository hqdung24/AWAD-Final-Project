import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RouteService } from '@/modules/route/route.service';
import { BusService } from '@/modules/bus/bus.service';
import { TripRepository } from '../trip.repository';

@Injectable()
export class TripValidationProvider {
  constructor(
    private readonly routeService: RouteService,
    private readonly busService: BusService,
    private readonly tripRepository: TripRepository,
  ) {}

  async validateRouteExists(routeId: string): Promise<void> {
    const route = await this.routeService.findById(routeId);
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }
    if (!route.isActive) {
      throw new ConflictException(`Route with ID ${routeId} is not active`);
    }
  }

  async validateBusExists(busId: string): Promise<void> {
    const bus = await this.busService.findById(busId);
    if (!bus) {
      throw new NotFoundException(`Bus with ID ${busId} not found`);
    }
    if (!bus.isActive) {
      throw new ConflictException(`Bus with ID ${busId} is not active`);
    }
  }

  async validateBusScheduling(
    busId: string,
    departureTime: Date,
    arrivalTime: Date,
    excludeTripId?: string,
  ): Promise<void> {
    // Validate time logic
    if (departureTime >= arrivalTime) {
      throw new ConflictException('Departure time must be before arrival time');
    }

    // Check for scheduling conflicts
    const conflicts = await this.tripRepository.findBusConflicts(
      busId,
      departureTime,
      arrivalTime,
      excludeTripId,
    );

    if (conflicts.length > 0) {
      throw new ConflictException(
        `Bus is already scheduled for another trip during this time period`,
      );
    }
  }
}
