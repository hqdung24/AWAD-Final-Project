import { Injectable } from '@nestjs/common';
import { BusRepository } from './bus.repository';
import { Bus } from './entities/bus.entity';
import { SeatRepository } from '../seat/seat.repository';

@Injectable()
export class BusService {
  constructor(
    private readonly busRepository: BusRepository,
    private readonly seatRepository: SeatRepository,
  ) {}

  async findById(id: string): Promise<Bus | null> {
    return await this.busRepository.findById(id);
  }

  async findAll(filters: {
    operatorId?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }): Promise<[Bus[], number]> {
    return await this.busRepository.findAll(filters);
  }

  async create(busData: Partial<Bus>): Promise<Bus> {
    return await this.busRepository.create(busData);
  }

  async update(id: string, updateData: Partial<Bus>): Promise<Bus | null> {
    return await this.busRepository.update(id, updateData);
  }

  async softDelete(id: string): Promise<Bus | null> {
    const deletedBus = await this.busRepository.softDelete(id);

    if (deletedBus) {
      // Soft-delete seats for this bus as well
      await this.seatRepository.softDeleteByBusId(id);
    }

    return deletedBus;
  }
}
