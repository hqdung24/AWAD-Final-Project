import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  BUS_DATA_PROVIDER,
  type BusAssignmentRecord,
  type BusDataProvider,
  type BusRecord,
  type SeatRecord,
} from './bus-data.provider';

@Injectable()
export class InMemoryBusProvider implements BusDataProvider {
  private buses: BusRecord[] = [
    {
      id: randomUUID(),
      operatorId: '00000000-0000-0000-0000-000000000001',
      name: 'Sleeper 40',
      plateNumber: '51F-12345',
      model: 'Thaco',
      seatCapacity: 40,
      seatMetaJson: '{"layout":"2x1"}',
    },
    {
      id: randomUUID(),
      operatorId: '00000000-0000-0000-0000-000000000002',
      name: 'VIP 28',
      plateNumber: '51F-98765',
      model: 'Hyundai',
      seatCapacity: 28,
      seatMetaJson: '{"layout":"2x1 deluxe"}',
    },
    {
      id: randomUUID(),
      operatorId: '00000000-0000-0000-0000-000000000001',
      name: 'City Shuttle 16',
      plateNumber: '50B-55555',
      model: 'Ford Transit',
      seatCapacity: 16,
      seatMetaJson: '{"layout":"2x2"}',
    },
    {
      id: randomUUID(),
      operatorId: '00000000-0000-0000-0000-000000000003',
      name: 'Express 32',
      plateNumber: '60C-11111',
      model: 'Hyundai Universe',
      seatCapacity: 32,
      seatMetaJson: '{"layout":"2x2"}',
    },
  ];

  private assignments: BusAssignmentRecord[] = [
    {
      id: randomUUID(),
      busId: '',
      routeId: 'route-hcm-hanoi',
      startTime: new Date(Date.now() + 86_400_000).toISOString(),
      endTime: new Date(Date.now() + 86_400_000 + 12 * 3_600_000).toISOString(),
    },
    {
      id: randomUUID(),
      busId: '',
      routeId: 'route-hcm-dalat',
      startTime: new Date(Date.now() + 2 * 86_400_000).toISOString(),
      endTime: new Date(Date.now() + 2 * 86_400_000 + 8 * 3_600_000).toISOString(),
    },
  ];

  constructor() {
    if (this.assignments[0]) {
      this.assignments[0].busId = this.buses[0].id;
    }
    if (this.assignments[1]) {
      this.assignments[1].busId = this.buses[1].id;
    }
  }

  private seatMaps: Record<string, SeatRecord[]> = {};

  private ensureSeatMap(busId: string) {
    if (!this.seatMaps[busId]) {
      const seats: SeatRecord[] = [];
      const baseCodes =
        this.buses.find((b) => b.id === busId)?.seatCapacity ?? 0;
      for (let i = 1; i <= Math.max(baseCodes, 12); i++) {
        const code = `A${i}`;
        seats.push({
          id: randomUUID(),
          seatCode: code,
          seatType: i <= 4 ? 'vip' : 'standard',
          isActive: i !== 3, // demo: seat 3 inactive
          price: i <= 4 ? 100000 : 0,
        });
      }
      this.seatMaps[busId] = seats;
    }
  }

  async listBuses(): Promise<BusRecord[]> {
    return [...this.buses];
  }

  async createBus(payload: Omit<BusRecord, 'id'>): Promise<BusRecord> {
    const record: BusRecord = { ...payload, id: randomUUID() };
    this.buses.push(record);
    return record;
  }

  async updateBus(
    id: string,
    payload: Partial<Omit<BusRecord, 'id'>>,
  ): Promise<BusRecord> {
    const idx = this.buses.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Bus not found');
    this.buses[idx] = { ...this.buses[idx], ...payload };
    return this.buses[idx];
  }

  async deleteBus(id: string): Promise<void> {
    this.buses = this.buses.filter((b) => b.id !== id);
    this.assignments = this.assignments.filter((a) => a.busId !== id);
  }

  async listAssignments(busId?: string): Promise<BusAssignmentRecord[]> {
    if (!busId) return [...this.assignments];
    return this.assignments.filter((a) => a.busId === busId);
  }

  private conflicts(payload: Omit<BusAssignmentRecord, 'id'>, excludeId?: string) {
    const start = new Date(payload.startTime).getTime();
    const end = new Date(payload.endTime).getTime();
    return this.assignments.some((a) => {
      if (excludeId && a.id === excludeId) return false;
      if (a.busId !== payload.busId) return false;
      const aStart = new Date(a.startTime).getTime();
      const aEnd = new Date(a.endTime).getTime();
      return start <= aEnd && aStart <= end;
    });
  }

  async assignBus(payload: Omit<BusAssignmentRecord, 'id'>): Promise<BusAssignmentRecord> {
    if (this.conflicts(payload)) {
      throw new Error('Bus already assigned in this time window');
    }
    const record: BusAssignmentRecord = { ...payload, id: randomUUID() };
    this.assignments.push(record);
    return record;
  }

  async deleteAssignment(id: string): Promise<void> {
    this.assignments = this.assignments.filter((a) => a.id !== id);
  }

  async getSeatMap(busId: string): Promise<SeatRecord[]> {
    this.ensureSeatMap(busId);
    return [...(this.seatMaps[busId] ?? [])];
  }

  async updateSeatMap(busId: string, seats: SeatRecord[]): Promise<SeatRecord[]> {
    this.seatMaps[busId] = seats.map((s) => ({
      ...s,
      id: s.id ?? randomUUID(),
      seatCode: s.seatCode,
      seatType: s.seatType,
      isActive: s.isActive ?? true,
      price: s.price ?? 0,
    }));
    return [...this.seatMaps[busId]];
  }
}
