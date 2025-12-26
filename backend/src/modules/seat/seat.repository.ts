import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';

@Injectable()
export class SeatRepository {
  constructor(
    @InjectRepository(Seat)
    private readonly repository: Repository<Seat>,
  ) {}

  async findByBusId(busId: string): Promise<Seat[]> {
    // Return all seats (active and inactive) so admins can manage visibility states
    return await this.repository.find({
      where: { busId },
      order: { seatCode: 'ASC' },
    });
  }

  async findActiveByBusId(busId: string): Promise<Seat[]> {
    return await this.repository.find({
      where: { busId, isActive: true },
      order: { seatCode: 'ASC' },
    });
  }

  async findByBusIdAndCode(busId: string, seatCode: string): Promise<Seat | null> {
    return await this.repository.findOne({
      where: { busId, seatCode },
    });
  }

  async countActiveByBusId(busId: string): Promise<number> {
    return await this.repository.count({ where: { busId, isActive: true } });
  }

  async findById(id: string): Promise<Seat | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['bus'],
    });
  }

  async findAll(filters: {
    busId?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }): Promise<[Seat[], number]> {
    const { busId, isActive, page, limit } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('seat')
      .leftJoinAndSelect('seat.bus', 'bus')
      .skip(skip)
      .take(limit)
      .orderBy('seat.seatCode', 'ASC');

    if (busId) {
      queryBuilder.andWhere('seat.busId = :busId', { busId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('seat.isActive = :isActive', { isActive });
    }

    return await queryBuilder.getManyAndCount();
  }

  async create(seatData: Partial<Seat>): Promise<Seat> {
    const seat = this.repository.create(seatData);
    return await this.repository.save(seat);
  }

  async createMany(seats: Partial<Seat>[]): Promise<Seat[]> {
    const entities = this.repository.create(seats);
    return await this.repository.save(entities);
  }

  async update(id: string, updateData: Partial<Seat>): Promise<Seat | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<Seat | null> {
    await this.repository.update(id, {
      isActive: false,
      deletedAt: new Date(),
    });
    return await this.findById(id);
  }

  async softDeleteByBusId(busId: string): Promise<void> {
    await this.repository.update(
      { busId },
      {
        isActive: false,
        deletedAt: new Date(),
      },
    );
  }

  async softDeleteByIds(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.repository.update(
      { id: In(ids) },
      {
        isActive: false,
        deletedAt: new Date(),
      },
    );
  }

  async save(seat: Seat): Promise<Seat> {
    return await this.repository.save(seat);
  }
}
