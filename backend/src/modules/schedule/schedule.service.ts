import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BookingService } from '../booking/booking.service';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationService } from '../notification/notification.service';
import { PaymentService } from '../payment/providers/payment.service';
import { SeatStatusService } from '../seat-status/seat-status.service';
@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  private lastReleaseRun?: Date;
  private lastReminderRun?: Date;
  constructor(
    private readonly seatStatusService: SeatStatusService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
    private readonly metricsService: MetricsService,
  ) {}
  // Add scheduling related methods here

  @Cron('0 */5 * * * *') // every 5 minutes
  async releaseExpiredJobs() {
    const now = new Date();
    this.logger.log(`[CRON] releaseExpiredSeats start at ${now.toISOString()}`);
    const start = Date.now();
    try {
      const releasedLocks =
        await this.seatStatusService.releaseLockedSeats(now);
      const paymentResult =
        await this.paymentService.checkAndUpdatePendingPayments();
      const bookingResult = await this.bookingService.expirePendingBooking();
      this.lastReleaseRun = new Date();

      this.metricsService.markJobSuccess(
        'releaseExpiredSeats',
        Date.now() - start,
      );
      this.metricsService.countCleanup(
        'payments_expired',
        paymentResult?.updated ?? 0,
      );
      this.metricsService.countCleanup(
        'bookings_expired',
        bookingResult?.updated ?? 0,
      );
      this.metricsService.countCleanup('seat_locks_released', releasedLocks);

      this.logger.log(
        `[CRON] releaseExpiredSeats done - payments expired: ${
          paymentResult?.updated ?? 0
        }, bookings expired: ${bookingResult?.updated ?? 0}, seat locks released: ${releasedLocks}`,
      );
    } catch (error) {
      this.metricsService.markJobFailure(
        'releaseExpiredSeats',
        Date.now() - start,
      );
      this.logger.warn(
        `[CRON] releaseExpiredSeats failed: ${(error as Error).message}`,
      );
    }
  }

  @Cron('0 */1 * * * *') // every 1 minute
  async sendTripReminders() {
    this.logger.log('[CRON] sendTripReminders start');
    const start = Date.now();
    try {
      const result24h = await this.notificationService.processReminderWindow({
        hoursFromNow: 24,
        bufferMinutes: 15,
        reminderField: 'reminder24hSentAt',
        reminderType: '24h',
      });

      this.logger.log(
        `[CRON] reminders 24h window start=${
          result24h.windowStart.toISOString().split('T')[0]
        } end=${result24h.windowEnd.toISOString().split('T')[0]} found=${
          result24h.totalBookings
        } sent=${result24h.sent} skippedPrefs=${result24h.skippedPrefs} skippedMissingContact=${result24h.skippedMissingContact} skippedDuplicate=${result24h.skippedDuplicate}`,
      );

      const result3h = await this.notificationService.processReminderWindow({
        hoursFromNow: 3,
        bufferMinutes: 10,
        reminderField: 'reminder3hSentAt',
        reminderType: '3h',
      });

      this.logger.log(
        `[CRON] reminders 3h window start=${
          result3h.windowStart.toISOString().split('T')[0]
        } end=${result3h.windowEnd.toISOString().split('T')[0]} found=${
          result3h.totalBookings
        } sent=${result3h.sent} skippedPrefs=${result3h.skippedPrefs} skippedMissingContact=${result3h.skippedMissingContact} skippedDuplicate=${result3h.skippedDuplicate}`,
      );

      this.lastReminderRun = new Date();
      this.metricsService.markJobSuccess(
        'sendTripReminders',
        Date.now() - start,
      );
      this.logger.log('[CRON] sendTripReminders done');
    } catch (error) {
      this.metricsService.markJobFailure(
        'sendTripReminders',
        Date.now() - start,
      );
      this.logger.warn(
        `[CRON] sendTripReminders failed: ${(error as Error).message}`,
      );
    }
  }

  getHealth() {
    return {
      lastReleaseRun: this.lastReleaseRun?.toISOString() ?? null,
      lastReminderRun: this.lastReminderRun?.toISOString() ?? null,
    };
  }
}
