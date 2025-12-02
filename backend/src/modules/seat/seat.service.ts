import { Injectable, NotFoundException } from '@nestjs/common';
import { SeatRepository } from './seat.repository';
import { Seat } from './entities/seat.entity';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { BusService } from '../bus/bus.service';

@Injectable()
export class SeatService {
  constructor(
    private readonly seatRepository: SeatRepository,
    private readonly busService: BusService,
  ) {}

  async findByBusId(busId: string): Promise<Seat[]> {
    return await this.seatRepository.findByBusId(busId);
  }

  async findById(id: string): Promise<Seat | null> {
    return await this.seatRepository.findById(id);
  }

  async findAll(filters: {
    busId?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }): Promise<[Seat[], number]> {
    return await this.seatRepository.findAll(filters);
  }

  async create(seatData: Partial<Seat>): Promise<Seat> {
    return await this.seatRepository.create(seatData);
  }

  async update(id: string, updateData: Partial<Seat>): Promise<Seat | null> {
    return await this.seatRepository.update(id, updateData);
  }

  async softDelete(id: string): Promise<Seat | null> {
    return await this.seatRepository.softDelete(id);
  }

  // New methods for seat management endpoints
  async getSeatsByBusId(busId: string): Promise<Seat[]> {
    // Validate bus exists
    const bus = await this.busService.findById(busId);
    if (!bus || !bus.isActive) {
      throw new NotFoundException(`Bus with ID ${busId} not found or inactive`);
    }

    return await this.findByBusId(busId);
  }

  async createSeat(busId: string, dto: CreateSeatDto): Promise<Seat> {
    // Validate bus exists
    const bus = await this.busService.findById(busId);
    if (!bus || !bus.isActive) {
      throw new NotFoundException(`Bus with ID ${busId} not found or inactive`);
    }

    const seatData: Partial<Seat> = {
      busId,
      seatCode: dto.seatCode,
      seatType: dto.seatType,
    };

    return await this.create(seatData);
  }

  async updateSeat(id: string, dto: UpdateSeatDto): Promise<Seat> {
    // Validate seat exists
    const seat = await this.findById(id);
    if (!seat || !seat.isActive) {
      throw new NotFoundException(`Seat with ID ${id} not found or inactive`);
    }

    const updateData: Partial<Seat> = {};
    if (dto.seatCode) updateData.seatCode = dto.seatCode;
    if (dto.seatType) updateData.seatType = dto.seatType;

    const updatedSeat = await this.update(id, updateData);
    if (!updatedSeat) {
      throw new NotFoundException(`Failed to update seat with ID ${id}`);
    }

    return updatedSeat;
  }
}
