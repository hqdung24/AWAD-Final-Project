import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BusRepository } from './bus.repository';
import { Bus } from './entities/bus.entity';
import { SeatRepository } from '../seat/seat.repository';
import { SeatType } from '../seat/enums/seat-type.enum';
import { OperatorRepository } from '../operator/operator.repository';
import { TripRepository } from '../trip/trip.repository';

@Injectable()
export class BusService {
  constructor(
    private readonly busRepository: BusRepository,
    private readonly seatRepository: SeatRepository,
    private readonly operatorRepository: OperatorRepository,
    private readonly tripRepository: TripRepository,
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
    if (!busData.operatorId) {
      throw new BadRequestException('operatorId is required');
    }
    const operator = await this.operatorRepository.findOne(busData.operatorId);
    if (!operator) {
      throw new NotFoundException(`Operator ${busData.operatorId} not found`);
    }

    if (!busData.plateNumber?.trim()) {
      throw new BadRequestException('plateNumber is required');
    }
    const normalizedPlate = busData.plateNumber.trim();
    const existingPlate =
      await this.busRepository.findActiveByPlateNumber(normalizedPlate);
    if (existingPlate) {
      throw new ConflictException(
        `Plate number ${normalizedPlate} is already in use`,
      );
    }

    if (busData.amenitiesJson !== undefined) {
      const raw = busData.amenitiesJson ?? '';
      const trimmed = raw.trim();
      if (!trimmed) {
        busData.amenitiesJson = null;
      } else {
        try {
          JSON.parse(trimmed);
        } catch {
          throw new BadRequestException('amenitiesJson must be valid JSON');
        }
        busData.amenitiesJson = trimmed;
      }
    }

    if (busData.seatCapacity !== undefined && busData.seatCapacity < 1) {
      throw new BadRequestException('seatCapacity must be at least 1');
    }

    const bus = await this.busRepository.create({
      ...busData,
      plateNumber: normalizedPlate,
    });
    const seatCapacity = Number(bus.seatCapacity ?? 0);
    if (seatCapacity > 0) {
      const seats: Partial<import('../seat/entities/seat.entity').Seat>[] = [];
      const columns = 4;
      const rows = Math.ceil(seatCapacity / columns);
      let remaining = seatCapacity;

      for (let row = 0; row < rows; row += 1) {
        const rowLetter = String.fromCharCode(65 + row);
        for (let col = 1; col <= columns; col += 1) {
          if (remaining <= 0) break;
          seats.push({
            busId: bus.id,
            seatCode: `${rowLetter}${col}`,
            seatType: SeatType.STANDARD,
            isActive: true,
          });
          remaining -= 1;
        }
      }

      if (seats.length > 0) {
        await this.seatRepository.createMany(seats);
      }
    }
    return bus;
  }

  async update(id: string, updateData: Partial<Bus>): Promise<Bus | null> {
    const existing = await this.busRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Bus with ID ${id} not found`);
    }

    if (updateData.isActive === false && existing.isActive) {
      const upcomingTrips = await this.tripRepository.findUpcomingByBusId(id);
      if (upcomingTrips.length > 0) {
        throw new ConflictException(
          'Cannot deactivate bus with upcoming scheduled trips',
        );
      }
    }

    if (updateData.operatorId && updateData.operatorId !== existing.operatorId) {
      const operator = await this.operatorRepository.findOne(
        updateData.operatorId,
      );
      if (!operator) {
        throw new NotFoundException(
          `Operator ${updateData.operatorId} not found`,
        );
      }
    }

    if (updateData.plateNumber) {
      const normalizedPlate = updateData.plateNumber.trim();
      if (!normalizedPlate) {
        throw new BadRequestException('plateNumber is required');
      }
      const existingPlate =
        await this.busRepository.findActiveByPlateNumber(normalizedPlate);
      if (existingPlate && existingPlate.id !== id) {
        throw new ConflictException(
          `Plate number ${normalizedPlate} is already in use`,
        );
      }
      updateData.plateNumber = normalizedPlate;
    }

    if (updateData.amenitiesJson !== undefined) {
      const raw = updateData.amenitiesJson ?? '';
      const trimmed = raw.trim();
      if (!trimmed) {
        updateData.amenitiesJson = null;
      } else {
        try {
          JSON.parse(trimmed);
        } catch {
          throw new BadRequestException('amenitiesJson must be valid JSON');
        }
        updateData.amenitiesJson = trimmed;
      }
    }

    if (updateData.seatCapacity !== undefined) {
      if (updateData.seatCapacity < 1) {
        throw new BadRequestException('seatCapacity must be at least 1');
      }
      const activeSeats = await this.seatRepository.countActiveByBusId(id);
      if (updateData.seatCapacity < activeSeats) {
        throw new ConflictException(
          `seatCapacity (${updateData.seatCapacity}) cannot be lower than active seats (${activeSeats})`,
        );
      }
    }

    return await this.busRepository.update(id, updateData);
  }

  async softDelete(id: string): Promise<Bus | null> {
    const upcomingTrips = await this.tripRepository.findUpcomingByBusId(id);
    if (upcomingTrips.length > 0) {
      throw new ConflictException(
        'Cannot delete bus with upcoming scheduled trips',
      );
    }

    const deletedBus = await this.busRepository.softDelete(id);

    if (deletedBus) {
      // Soft-delete seats for this bus as well
      await this.seatRepository.softDeleteByBusId(id);
    }

    return deletedBus;
  }
}
