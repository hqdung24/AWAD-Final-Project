import { Injectable } from '@nestjs/common';
import { SeatStatusRepository } from './seat-status.repository';
import { SeatStatus } from './entities/seat-status.entity';
import { SeatLockProvider } from './providers/seat-lock.provider';

@Injectable()
export class SeatStatusService {
  constructor(
    private readonly seatStatusRepository: SeatStatusRepository,
    private readonly seatLockProvider: SeatLockProvider,
  ) {}

  async save(seatStatus: SeatStatus): Promise<SeatStatus> {
    return await this.seatStatusRepository.save(seatStatus);
  }

  async findById(id: string): Promise<SeatStatus | null> {
    return await this.seatStatusRepository.findById(id);
  }

  async findByTripId(tripId: string): Promise<SeatStatus[]> {
    return await this.seatStatusRepository.findByTripId(tripId);
  }

  async findBySeatId(seatId: string): Promise<SeatStatus[]> {
    return await this.seatStatusRepository.findBySeatId(seatId);
  }

  async findAll(filters: {
    tripId?: string;
    seatId?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<[SeatStatus[], number]> {
    return await this.seatStatusRepository.findAll(filters);
  }

  async create(seatStatusData: Partial<SeatStatus>): Promise<SeatStatus> {
    return await this.seatStatusRepository.create(seatStatusData);
  }

  async update(
    id: string,
    updateData: Partial<SeatStatus>,
  ): Promise<SeatStatus | null> {
    return await this.seatStatusRepository.update(id, updateData);
  }

  async delete(id: string): Promise<void> {
    return await this.seatStatusRepository.delete(id);
  }

  /**
   * Lock seats for a trip
   */
  async lockSeats(
    tripId: string,
    seatIds: string[],
  ): Promise<{
    seatIds: string[];
    lockedUntil: string;
    lockToken: string;
  }> {
    return await this.seatLockProvider.lockSeatsForTrip(tripId, seatIds);
  }

  /**
   * Verify and decode lock token
   */
  verifyLockToken(token: string) {
    return this.seatLockProvider.verifyLockToken(token);
  }

  /**
   * Unlock seats
   */
  async unlockSeats(tripId: string, seatIds: string[]): Promise<void> {
    return await this.seatLockProvider.unlockSeats(tripId, seatIds);
  }

  async releaseLockedSeats(timeCheck: Date): Promise<void> {
    return await this.seatStatusRepository.releaseSeatLocks(timeCheck);
  }

  /**
   * Get lock duration in seconds
   */
  getLockDuration(): number {
    return this.seatLockProvider.getLockDuration();
  }
}
