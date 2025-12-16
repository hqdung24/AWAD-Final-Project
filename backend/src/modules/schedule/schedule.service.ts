import { Injectable } from '@nestjs/common';
import { SeatStatusService } from '../seat-status/seat-status.service';
import { Cron } from '@nestjs/schedule';
import { BookingService } from '../booking/booking.service';
import { PaymentService } from '../payment/providers/payment.service';
import { BookingEmailProvider } from '../booking/providers/booking-email.provider';
import { NotificationService } from '../notification/notification.service';
import type { Booking } from '../booking/entities/booking.entity';
@Injectable()
export class ScheduleService {
  constructor(
    private readonly seatStatusService: SeatStatusService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
    private readonly bookingEmailProvider: BookingEmailProvider,
    private readonly notificationService: NotificationService,
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

    for (const booking of bookings) {
      if (booking.userId) {
        const prefs = await this.notificationService.getPreferencesForUser(
          booking.userId,
        );
        if (!prefs.emailRemindersEnabled) {
          continue;
        }
      }

      const to = booking.email || booking.user?.email;
      if (!to) continue;

      const marked = await this.bookingService.markReminderSent(
        booking.id,
        options.reminderField,
      );
      if (!marked) continue;

      await this.bookingEmailProvider.sendTripReminderEmail(
        to,
        this.buildReminderPayload(booking, options.reminderType),
      );
    }
  }

  @Cron('0 */15 * * * *') // every 15 minutes
  async sendTripReminders() {
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
  }
}
