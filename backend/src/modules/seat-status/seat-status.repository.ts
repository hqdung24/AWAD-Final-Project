import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatStatus } from './entities/seat-status.entity';

@Injectable()
export class SeatStatusRepository {
  readonly repository: Repository<SeatStatus>;

  constructor(
    @InjectRepository(SeatStatus)
    repository: Repository<SeatStatus>,
  ) {
    this.repository = repository;
  }

  async save(seatStatus: SeatStatus): Promise<SeatStatus> {
    return await this.repository.save(seatStatus);
  }

  async findById(id: string): Promise<SeatStatus | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['trip', 'seat'],
    });
  }

  async findByTripId(tripId: string): Promise<SeatStatus[]> {
    return await this.repository.find({
      where: { tripId },
      relations: ['seat'],
      order: { seat: { seatCode: 'ASC' } },
    });
  }

  async findBySeatId(seatId: string): Promise<SeatStatus[]> {
    return await this.repository.find({
      where: { seatId },
      relations: ['trip'],
      order: { trip: { departureTime: 'DESC' } },
    });
  }

  async findAll(filters: {
    tripId?: string;
    seatId?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<[SeatStatus[], number]> {
    const { tripId, seatId, status, page, limit } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('seatStatus')
      .leftJoinAndSelect('seatStatus.trip', 'trip')
      .leftJoinAndSelect('seatStatus.seat', 'seat')
      .skip(skip)
      .take(limit)
      .orderBy('trip.departureTime', 'DESC');

    if (tripId) {
      queryBuilder.andWhere('seatStatus.tripId = :tripId', { tripId });
    }

    if (seatId) {
      queryBuilder.andWhere('seatStatus.seatId = :seatId', { seatId });
    }

    if (status) {
      queryBuilder.andWhere('seatStatus.status = :status', { status });
    }

    return await queryBuilder.getManyAndCount();
  }

  async create(seatStatusData: Partial<SeatStatus>): Promise<SeatStatus> {
    const seatStatus = this.repository.create(seatStatusData);
    return await this.repository.save(seatStatus);
  }

  async update(
    id: string,
    updateData: Partial<SeatStatus>,
  ): Promise<SeatStatus | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async releaseSeatLocks(timeCheck: Date): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(SeatStatus)
      .set({
        state: 'available',
        lockedUntil: null,
      })
      .where('state = :state', { state: 'locked' })
      .andWhere('state != :booked', { booked: 'booked' }) //not release lock of booked seats
      .andWhere('lockedUntil <= :now', { now: timeCheck })
      .execute();
  }
}
