import { Injectable } from '@nestjs/common';
import { SeatStatusService } from '../seat-status/seat-status.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ScheduleService {
  constructor(private readonly seatStatusService: SeatStatusService) {}
  // Add scheduling related methods here

  @Cron('*/60 * * * * *') // chạy mỗi 60s
  async releaseExpiredSeats() {
    const now = new Date();

    await this.seatStatusService.releaseLockedSeats(now);
    console.log(`[CRON] Released expired seat locks at `);
  }
}
