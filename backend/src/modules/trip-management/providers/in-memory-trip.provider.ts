import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  TRIP_DATA_PROVIDER,
  type BusRecord,
  type StopRecord,
  type TripDataProvider,
  type TripRecord,
} from './trip-data.provider';

@Injectable()
export class InMemoryTripProvider implements TripDataProvider {
  private buses: BusRecord[] = [
    { id: randomUUID(), name: 'Sleeper 40', capacity: 40, seatLayout: '2x1' },
    { id: randomUUID(), name: 'VIP 28', capacity: 28, seatLayout: '2x1 deluxe' },
  ];

  private trips: TripRecord[] = [
    {
      id: randomUUID(),
      routeId: 'route-hcm-hanoi',
      busId: this.buses[0].id,
      departureTime: new Date(Date.now() + 86_400_000).toISOString(),
      arrivalTime: new Date(Date.now() + 86_400_000 + 12 * 3_600_000).toISOString(),
      seatLayout: this.buses[0].seatLayout,
      status: 'scheduled',
      stops: [
        { id: randomUUID(), name: 'HCM Station', type: 'pickup', order: 1 },
        { id: randomUUID(), name: 'Da Nang Stop', type: 'dropoff', order: 2 },
        { id: randomUUID(), name: 'Hanoi Station', type: 'dropoff', order: 3 },
      ],
    },
  ];

  async listTrips(): Promise<TripRecord[]> {
    return [...this.trips];
  }

  async listBuses(): Promise<BusRecord[]> {
    return [...this.buses];
  }

  async findTrip(id: string): Promise<TripRecord | undefined> {
    return this.trips.find((t) => t.id === id);
  }

  private hasConflict(payload: Omit<TripRecord, 'id'>, excludeId?: string) {
    // naive conflict check: same bus overlaps within +/- 1 hour of departure
    const dep = new Date(payload.departureTime).getTime();
    const arr = new Date(payload.arrivalTime).getTime();
    return this.trips.some((t) => {
      if (excludeId && t.id === excludeId) return false;
      if (t.busId !== payload.busId) return false;
      const tDep = new Date(t.departureTime).getTime();
      const tArr = new Date(t.arrivalTime).getTime();
      return dep <= tArr + 3_600_000 && tDep <= arr + 3_600_000;
    });
  }

  async createTrip(payload: Omit<TripRecord, 'id'>): Promise<TripRecord> {
    if (this.hasConflict(payload)) {
      throw new Error('Scheduling conflict for this bus');
    }
    const record: TripRecord = {
      ...payload,
      id: randomUUID(),
      stops: payload.stops?.map((s) => ({ ...s, id: s.id ?? randomUUID() })) ?? [],
    };
    this.trips.push(record);
    return record;
  }

  async updateTrip(
    id: string,
    payload: Partial<Omit<TripRecord, 'id'>>,
  ): Promise<TripRecord> {
    const idx = this.trips.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Trip not found');
    const merged: TripRecord = {
      ...this.trips[idx],
      ...payload,
      stops:
        payload.stops?.map((s) => ({ ...s, id: s.id ?? randomUUID() })) ??
        this.trips[idx].stops,
    };
    if (
      payload.busId ||
      payload.departureTime ||
      payload.arrivalTime
    ) {
      if (
        this.hasConflict(
          {
            ...merged,
            id: undefined as any,
          },
          id,
        )
      ) {
        throw new Error('Scheduling conflict for this bus');
      }
    }
    this.trips[idx] = merged;
    return merged;
  }

  async deleteTrip(id: string): Promise<void> {
    this.trips = this.trips.filter((t) => t.id !== id);
  }
}
