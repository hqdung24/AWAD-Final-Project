import { Injectable } from '@nestjs/common';
import { SeatStatusService } from '../seat-status/seat-status.service';
import { Cron } from '@nestjs/schedule';
import { BookingService } from '../booking/booking.service';
import { PaymentService } from '../payment/providers/payment.service';
@Injectable()
export class ScheduleService {
  constructor(
    private readonly seatStatusService: SeatStatusService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
  ) {}
  // Add scheduling related methods here

  @Cron('*/300 * * * * *') // chạy mỗi 5 phút
  async releaseExpiredSeats() {
    const now = new Date();
    console.log('now UTC      :', now.toISOString());

    await this.seatStatusService.releaseLockedSeats(now);
    await this.paymentService.checkAndUpdatePendingPayments();
    await this.bookingService.expirePendingBooking();
    console.log(`[CRON] Released expired seat locks, update payment statuses `);
  }
}
