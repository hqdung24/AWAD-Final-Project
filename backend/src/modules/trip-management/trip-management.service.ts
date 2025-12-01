import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  TRIP_DATA_PROVIDER,
  type TripDataProvider,
  type TripRecord,
  type BusRecord,
} from './providers/trip-data.provider';
import { CreateTripDto, UpdateTripDto } from './dtos/trip.dto';

@Injectable()
export class TripManagementService {
  constructor(
    @Inject(TRIP_DATA_PROVIDER)
    private readonly tripProvider: TripDataProvider,
  ) {}

  listTrips(): Promise<TripRecord[]> {
    return this.tripProvider.listTrips();
  }

  listBuses(): Promise<BusRecord[]> {
    return this.tripProvider.listBuses();
  }

  async getTrip(id: string): Promise<TripRecord> {
    const found = await this.tripProvider.findTrip(id);
    if (!found) throw new NotFoundException('Trip not found');
    return found;
  }

  async createTrip(dto: CreateTripDto): Promise<TripRecord> {
    try {
      return await this.tripProvider.createTrip({
        ...dto,
        stops: dto.stops ?? [],
      });
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  async updateTrip(id: string, dto: UpdateTripDto): Promise<TripRecord> {
    await this.getTrip(id);
    try {
      return await this.tripProvider.updateTrip(id, {
        ...dto,
        stops: dto.stops ?? [],
      });
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  async deleteTrip(id: string): Promise<void> {
    await this.getTrip(id);
    await this.tripProvider.deleteTrip(id);
  }
}
