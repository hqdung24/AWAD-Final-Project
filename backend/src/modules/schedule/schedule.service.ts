import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { BookingService } from '../booking/booking.service';
import { BookingRepository } from '../booking/booking.repository';
import { BookingEmailProvider } from '../booking/providers/booking-email.provider';
import { MetricsService } from '../metrics/metrics.service';
import { NotificationService } from '../notification/notification.service';
import { PaymentService } from '../payment/providers/payment.service';
import { SeatStatusService } from '../seat-status/seat-status.service';
import { TripService } from '../trip/trip.service';
import { TripRepository } from '../trip/trip.repository';
@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  private lastReleaseRun?: Date;
  private lastReminderRun?: Date;
  private readonly routeDeactivationQueue = new Map<string, Date>();
  private isProcessingRouteDeactivation = false;
  constructor(
    private readonly seatStatusService: SeatStatusService,
    private readonly bookingService: BookingService,
    private readonly bookingRepository: BookingRepository,
    private readonly bookingEmailProvider: BookingEmailProvider,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
    private readonly metricsService: MetricsService,
    private readonly tripService: TripService,
    private readonly tripRepository: TripRepository,
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

  @Cron('0 */5 * * * *') // every 5 minute
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

  @Cron('0 */1 * * * *') // every 1 minute
  async autoUpdateTripStatuses() {
    const now = new Date();
    this.logger.log(
      `[CRON] autoUpdateTripStatuses start at ${now.toISOString()}`,
    );
    try {
      const result = await this.tripService.autoUpdateTripStatuses(now);
      this.logger.log(
        `[CRON] autoUpdateTripStatuses done - cancelled=${result.cancelled} inProgress=${result.inProgress} completed=${result.completed} archived=${result.archived}`,
      );
    } catch (error) {
      this.logger.warn(
        `[CRON] autoUpdateTripStatuses failed: ${(error as Error).message}`,
      );
    }
  }

  @OnEvent('route.deactivated')
  handleRouteDeactivated(payload: { routeId: string }) {
    if (!payload?.routeId) return;
    if (!this.routeDeactivationQueue.has(payload.routeId)) {
      this.routeDeactivationQueue.set(payload.routeId, new Date());
      this.logger.log(
        `[QUEUE] route.deactivated enqueued routeId=${payload.routeId}`,
      );
    }
  }

  @Cron('*/30 * * * * *') // every 30 seconds
  async processRouteDeactivationJobs() {
    if (this.isProcessingRouteDeactivation) return;
    if (this.routeDeactivationQueue.size === 0) return;
    this.isProcessingRouteDeactivation = true;
    const start = Date.now();
    try {
      for (const [routeId] of this.routeDeactivationQueue) {
        this.routeDeactivationQueue.delete(routeId);
        await this.processRouteDeactivation(routeId);
      }
      this.metricsService.markJobSuccess(
        'route_deactivation',
        Date.now() - start,
      );
    } catch (error) {
      this.metricsService.markJobFailure(
        'route_deactivation',
        Date.now() - start,
      );
      this.logger.warn(
        `[CRON] route_deactivation failed: ${(error as Error).message}`,
      );
    } finally {
      this.isProcessingRouteDeactivation = false;
    }
  }

  private async processRouteDeactivation(routeId: string) {
    const now = new Date();
    const trips = await this.tripRepository.findScheduledByRouteId(
      routeId,
      now,
    );
    if (trips.length === 0) return;

    const tripIds = trips.map((trip) => trip.id);
    const cancelledTrips =
      await this.tripRepository.cancelScheduledByIds(tripIds);
    const cancelledBookings =
      await this.bookingRepository.cancelBookingsByTripIds(tripIds);

    for (const booking of cancelledBookings) {
      const email = booking.email || booking.user?.email;
      if (!email) continue;

      const seatsFromStatus =
        booking.seatStatuses
          ?.map((ss) => ss.seat?.seatCode)
          .filter((seat): seat is string => Boolean(seat)) ?? [];
      const seatsFromPassengers =
        booking.passengerDetails
          ?.map((passenger) => passenger.seatCode)
          .filter((seat): seat is string => Boolean(seat)) ?? [];
      const seats =
        seatsFromStatus.length > 0 ? seatsFromStatus : seatsFromPassengers;

      const contactName =
        booking.name ||
        `${booking.user?.firstName ?? ''} ${booking.user?.lastName ?? ''}`.trim();

      await this.bookingEmailProvider.sendBookingCancelledEmail(email, {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        origin: booking.trip?.route?.origin || '—',
        destination: booking.trip?.route?.destination || '—',
        departureTime: booking.trip?.departureTime?.toISOString?.() || '',
        seats,
        contact: {
          name: contactName || null,
          email,
          phone: booking.phone || null,
        },
        reason: 'The route for your trip was deactivated.',
      });
    }

    this.logger.log(
      `[CRON] route_deactivation routeId=${routeId} trips=${cancelledTrips} bookings=${cancelledBookings.length}`,
    );
  }

  getHealth() {
    return {
      lastReleaseRun: this.lastReleaseRun?.toISOString() ?? null,
      lastReminderRun: this.lastReminderRun?.toISOString() ?? null,
    };
  }
}
