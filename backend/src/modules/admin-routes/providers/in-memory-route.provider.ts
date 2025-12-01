import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  RouteDataProvider,
  type RouteRecord,
} from './route-data.provider';

@Injectable()
export class InMemoryRouteProvider implements RouteDataProvider {
  private routes: RouteRecord[] = [
    {
      id: randomUUID(),
      operatorId: '00000000-0000-0000-0000-000000000001',
      origin: 'Ho Chi Minh City',
      destination: 'Hanoi',
      stops: [
        { id: randomUUID(), name: 'HCM Station', type: 'pickup', order: 1 },
        { id: randomUUID(), name: 'Da Nang Stop', type: 'dropoff', order: 2 },
        { id: randomUUID(), name: 'Hanoi Station', type: 'dropoff', order: 3 },
      ],
      distanceKm: 1700,
      estimatedMinutes: 1500,
      notes: 'Mock route seeded for admin CRUD.',
    },
    {
      id: randomUUID(),
      operatorId: '00000000-0000-0000-0000-000000000002',
      origin: 'Da Nang',
      destination: 'Hue',
      stops: [
        { id: randomUUID(), name: 'Da Nang City', type: 'pickup', order: 1 },
        { id: randomUUID(), name: 'Lang Co', type: 'dropoff', order: 2 },
        { id: randomUUID(), name: 'Hue Center', type: 'dropoff', order: 3 },
      ],
      distanceKm: 100,
      estimatedMinutes: 120,
      notes: 'Coastal scenic route',
    },
  ];

  async list(): Promise<RouteRecord[]> {
    return [...this.routes];
  }

  async findById(id: string): Promise<RouteRecord | undefined> {
    return this.routes.find((r) => r.id === id);
  }

  async create(payload: Omit<RouteRecord, 'id'>): Promise<RouteRecord> {
    const record: RouteRecord = {
      id: randomUUID(),
      ...payload,
      stops: payload.stops?.map((s) => ({ ...s, id: s.id ?? randomUUID() })),
    };
    this.routes.push(record);
    return record;
  }

  async update(
    id: string,
    payload: Partial<Omit<RouteRecord, 'id'>>,
  ): Promise<RouteRecord> {
    const idx = this.routes.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error('Route not found');
    }
    const updated = {
      ...this.routes[idx],
      ...payload,
      stops: payload.stops
        ? payload.stops.map((s) => ({ ...s, id: s.id ?? randomUUID() }))
        : this.routes[idx].stops,
    };
    this.routes[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.routes = this.routes.filter((r) => r.id !== id);
  }
}
