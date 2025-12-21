import { Injectable } from '@nestjs/common';
import { RedisService } from '@/modules/redis/redis.service';

@Injectable()
export class SeatSelectingProvider {
  /**
   * Selecting TTL (seconds)
   * Short-lived on purpose (UX only)
   */
  private readonly SELECTING_TTL_SECONDS = 600; // 10 minutes

  constructor(private readonly redisService: RedisService) {}

  private generateKey(tripId: string, seatId: string): string {
    return `seat:selecting:${tripId}:${seatId}`;
  }

  /**
   * Try to select a seat (atomic)
   * Returns true if success, false if already selected by someone else
   */
  async trySelectSeat(
    tripId: string,
    seatId: string,
    userId: string,
  ): Promise<boolean> {
    const key = this.generateKey(tripId, seatId);

    return this.redisService.setIfNotExists(
      key,
      userId,
      this.SELECTING_TTL_SECONDS,
    );
  }

  /**
   * Get the current selector of a seat
   */
  async getSeatSelector(
    tripId: string,
    seatId: string,
  ): Promise<string | null> {
    const key = this.generateKey(tripId, seatId);
    return this.redisService.get(key);
  }

  /**
   * Release a selected seat
   * Only the owner can release it
   */
  async releaseSeat(
    tripId: string,
    seatId: string,
    userId: string,
  ): Promise<boolean> {
    const key = this.generateKey(tripId, seatId);
    const currentOwner = await this.redisService.get(key);

    if (currentOwner !== userId) {
      return false;
    }

    await this.redisService.del(key);
    return true;
  }

  /**
   * Check if a seat is selected by a specific user
   */
  async isSeatSelectedByUser(
    tripId: string,
    seatId: string,
    userId: string,
  ): Promise<boolean> {
    const currentOwner = await this.getSeatSelector(tripId, seatId);
    return currentOwner === userId;
  }

  async isSeatSelected(tripId: string, seatId: string): Promise<boolean> {
    const currentOwner = await this.getSeatSelector(tripId, seatId);
    return currentOwner !== null;
  }
}
