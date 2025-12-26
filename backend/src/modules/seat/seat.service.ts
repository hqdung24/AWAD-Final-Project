import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { SeatRepository } from './seat.repository';
import { Seat } from './entities/seat.entity';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { BusService } from '../bus/bus.service';
import { TripService } from '../trip/trip.service';
import { SeatType } from './enums/seat-type.enum';

@Injectable()
export class SeatService {
  constructor(
    private readonly seatRepository: SeatRepository,
    private readonly busService: BusService,
    @Inject(forwardRef(() => TripService))
    private readonly tripService: TripService,
  ) {}

  async findByBusId(busId: string): Promise<Seat[]> {
    return await this.seatRepository.findByBusId(busId);
  }

  async findActiveByBusId(busId: string): Promise<Seat[]> {
    return await this.seatRepository.findActiveByBusId(busId);
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
    const updated = await this.seatRepository.softDelete(id);
    if (updated?.busId) {
      await this.tripService.syncUpcomingTripsForBus(updated.busId);
    }
    return updated;
  }

  // New methods for seat management endpoints
  async getSeatsByBusId(busId: string): Promise<Seat[]> {
    // Validate bus exists
    const bus = await this.busService.findById(busId);
    if (!bus || !bus.isActive) {
      throw new NotFoundException(`Bus with ID ${busId} not found or inactive`);
    }

    const seats = await this.findByBusId(busId);
    return await this.cleanupDuplicateSeats(seats);
  }

  async createSeat(busId: string, dto: CreateSeatDto): Promise<Seat> {
    // Validate bus exists
    const bus = await this.busService.findById(busId);
    if (!bus || !bus.isActive) {
      throw new NotFoundException(`Bus with ID ${busId} not found or inactive`);
    }

    // Prevent duplicate seat codes on the same bus
    const existing = await this.seatRepository.findByBusIdAndCode(
      busId,
      dto.seatCode,
    );
    if (existing) {
      throw new ConflictException(
        `Seat code ${dto.seatCode} already exists on this bus`,
      );
    }

    const seatData: Partial<Seat> = {
      busId,
      seatCode: dto.seatCode,
      seatType: dto.seatType,
    };

    const created = await this.create(seatData);
    await this.tripService.syncUpcomingTripsForBus(busId);
    return created;
  }

  async updateSeat(id: string, dto: UpdateSeatDto): Promise<Seat> {
    // Validate seat exists
    const seat = await this.findById(id);
    if (!seat) {
      throw new NotFoundException(`Seat with ID ${id} not found`);
    }

    const updateData: Partial<Seat> = {};
    if (dto.seatCode) updateData.seatCode = dto.seatCode;
    if (dto.seatType) updateData.seatType = dto.seatType;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updatedSeat = await this.update(id, updateData);
    if (!updatedSeat) {
      throw new NotFoundException(`Failed to update seat with ID ${id}`);
    }

    await this.tripService.syncUpcomingTripsForBus(updatedSeat.busId);
    return updatedSeat;
  }

  async generateSeats(
    busId: string,
    config: {
      capacity: number;
      columns: number;
      seatType: SeatType;
      replaceExisting?: boolean;
    },
  ): Promise<Seat[]> {
    const bus = await this.busService.findById(busId);
    if (!bus || !bus.isActive) {
      throw new NotFoundException(`Bus with ID ${busId} not found or inactive`);
    }

    const capacity = Math.max(0, Math.floor(config.capacity));
    if (!capacity || capacity <= 0) return [];

    if (config.replaceExisting) {
      await this.seatRepository.softDeleteByBusId(busId);
    } else {
      const existing = await this.seatRepository.findActiveByBusId(busId);
      if (existing.length > 0) {
        throw new ConflictException(
          'Bus already has active seats. Use replaceExisting to regenerate.',
        );
      }
    }

    const seats: Partial<Seat>[] = [];
    const columns = Math.max(1, Math.floor(config.columns));
    const rows = Math.ceil(capacity / columns);
    let remaining = capacity;

    for (let row = 0; row < rows; row += 1) {
      const rowLetter = String.fromCharCode(65 + row);
      for (let col = 1; col <= columns; col += 1) {
        if (remaining <= 0) break;
        seats.push({
          busId,
          seatCode: `${rowLetter}${col}`,
          seatType: config.seatType,
        });
        remaining -= 1;
      }
    }

    const created = await this.seatRepository.createMany(seats);
    await this.tripService.syncUpcomingTripsForBus(busId);
    return created;
  }

  private async cleanupDuplicateSeats(seats: Seat[]): Promise<Seat[]> {
    const byCode = new Map<string, Seat[]>();
    seats.forEach((seat) => {
      const code = seat.seatCode?.trim();
      if (!code) return;
      const existing = byCode.get(code) ?? [];
      existing.push(seat);
      byCode.set(code, existing);
    });

    const toDelete: Seat[] = [];
    byCode.forEach((items) => {
      if (items.length <= 1) return;
      const sorted = [...items].sort((a, b) => {
        const timeA = a.createdAt ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt ? b.createdAt.getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return b.id.localeCompare(a.id);
      });
      toDelete.push(...sorted.slice(1));
    });

    if (toDelete.length === 0) return seats;

    await this.seatRepository.softDeleteByIds(toDelete.map((seat) => seat.id));
    const toDeleteIds = new Set(toDelete.map((seat) => seat.id));
    return seats.filter((seat) => !toDeleteIds.has(seat.id));
  }
}
