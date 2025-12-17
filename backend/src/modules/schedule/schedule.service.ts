import { Injectable, Logger } from '@nestjs/common';
import { SeatStatusService } from '../seat-status/seat-status.service';
import { Cron } from '@nestjs/schedule';
import { BookingService } from '../booking/booking.service';
import { PaymentService } from '../payment/providers/payment.service';
import { BookingEmailProvider } from '../booking/providers/booking-email.provider';
import { NotificationService } from '../notification/notification.service';
import type { Booking } from '../booking/entities/booking.entity';
@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  private lastReleaseRun?: Date;
  private lastReminderRun?: Date;
  constructor(
    private readonly seatStatusService: SeatStatusService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
    private readonly bookingEmailProvider: BookingEmailProvider,
    private readonly notificationService: NotificationService,
  ) {}
  // Add scheduling related methods here

  @Cron('0 */5 * * * *') // chạy mỗi 5 phút
  async releaseExpiredSeats() {
    const now = new Date();
    this.logger.log(
      `[CRON] releaseExpiredSeats start at ${now.toISOString()}`,
    );
    try {
      const releasedLocks = await this.seatStatusService.releaseLockedSeats(now);
      const paymentResult =
        await this.paymentService.checkAndUpdatePendingPayments();
      const bookingResult = await this.bookingService.expirePendingBooking();
      this.lastReleaseRun = new Date();

      this.logger.log(
        `[CRON] releaseExpiredSeats done - payments expired: ${
          paymentResult?.updated ?? 0
        }, bookings expired: ${bookingResult?.updated ?? 0}, seat locks released: ${releasedLocks}`,
      );
    } catch (error) {
      this.logger.warn(
        `[CRON] releaseExpiredSeats failed: ${(error as Error).message}`,
      );
    }
  }

  private buildReminderPayload(
    booking: Booking,
    reminderType: '24h' | '3h',
  ) {
    const seats =
      booking.seatStatuses?.map((s) => s.seat?.seatCode).filter(Boolean) ?? [];

    const passengers =
      booking.passengerDetails?.map((p) => ({
        fullName: p.fullName,
        seatCode: p.seatCode,
        documentId: p.documentId,
      })) ?? [];

    const contact = {
      name:
        booking.name ||
        [booking.user?.firstName, booking.user?.lastName]
          .filter(Boolean)
          .join(' ') ||
        null,
      email: booking.email || booking.user?.email || null,
      phone: booking.phone || booking.user?.phone || null,
    };

    return {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      origin: booking.trip?.route?.origin || '—',
      destination: booking.trip?.route?.destination || '—',
      departureTime: booking.trip?.departureTime?.toISOString?.() || '',
      arrivalTime: booking.trip?.arrivalTime?.toISOString?.(),
      seats,
      passengers,
      contact,
      reminderType,
      manageBookingUrl: booking.id,
    };
  }

  private async processReminderWindow(options: {
    hoursFromNow: number;
    bufferMinutes: number;
    reminderField: 'reminder24hSentAt' | 'reminder3hSentAt';
    reminderType: '24h' | '3h';
  }) {
    const now = Date.now();
    const windowStart = new Date(
      now + (options.hoursFromNow * 60 - options.bufferMinutes) * 60 * 1000,
    );
    const windowEnd = new Date(
      now + (options.hoursFromNow * 60 + options.bufferMinutes) * 60 * 1000,
    );

    const bookings = await this.bookingService.findBookingsForReminder(
      windowStart,
      windowEnd,
      options.reminderField,
    );

    let sent = 0;
    let skippedPrefs = 0;
    let skippedMissingContact = 0;
    let skippedDuplicate = 0;

    for (const booking of bookings) {
      if (booking.userId) {
        const prefs = await this.notificationService.getPreferencesForUser(
          booking.userId,
        );
        if (!prefs.emailRemindersEnabled) {
          skippedPrefs++;
          continue;
        }
      }

      const to = booking.email || booking.user?.email;
      if (!to) {
        skippedMissingContact++;
        continue;
      }

      const marked = await this.bookingService.markReminderSent(
        booking.id,
        options.reminderField,
      );
      if (!marked) {
        skippedDuplicate++;
        continue;
      }

      await this.bookingEmailProvider.sendTripReminderEmail(
        to,
        this.buildReminderPayload(booking, options.reminderType),
      );
      sent++;
    }

    this.logger.log(
      `[CRON] reminders ${options.reminderType}h window start=${
        windowStart.toISOString().split('T')[0]
      } end=${windowEnd.toISOString().split('T')[0]} found=${
        bookings.length
      } sent=${sent} skippedPrefs=${skippedPrefs} skippedMissingContact=${skippedMissingContact} skippedDuplicate=${skippedDuplicate}`,
    );
  }

  @Cron('0 */15 * * * *') // every 15 minutes
  async sendTripReminders() {
    this.logger.log('[CRON] sendTripReminders start');
    try {
      await this.processReminderWindow({
        hoursFromNow: 24,
        bufferMinutes: 15,
        reminderField: 'reminder24hSentAt',
        reminderType: '24h',
      });

      await this.processReminderWindow({
        hoursFromNow: 3,
        bufferMinutes: 10,
        reminderField: 'reminder3hSentAt',
        reminderType: '3h',
      });

      this.lastReminderRun = new Date();
      this.logger.log('[CRON] sendTripReminders done');
    } catch (error) {
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
