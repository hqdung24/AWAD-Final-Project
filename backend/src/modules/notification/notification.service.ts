import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { UsersService } from '../users/providers/users.service';
import type { NotificationPreference } from './entities/notification-preference.entity';
import type { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationCreateProvider } from './providers/notification-create.provider';
import { BookingService } from '../booking/booking.service';
import { BookingEmailProvider } from '../booking/providers/booking-email.provider';
import { NotificationReminderPayloadProvider } from './providers/notification-reminder-payload.provider';
import {
  BookingConfirmationPayloadDto,
  BookingIncompletePayloadDto,
  TripLiveUpdatePayloadDto,
  TripReminderPayloadDto,
} from './dto/create-notification.dto';
import {
  NotificationChannel,
  NotificationStatus,
} from './enums/notification.enum';
import type { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly usersService: UsersService,
    private readonly notificationCreateProvider: NotificationCreateProvider,
    private readonly bookingService: BookingService,
    private readonly bookingEmailProvider: BookingEmailProvider,
    private readonly notificationReminderPayloadProvider: NotificationReminderPayloadProvider,
  ) {}

  async getPreferencesForUser(userId: string): Promise<NotificationPreference> {
    const existing =
      await this.notificationRepository.findPreferenceByUserId(userId);

    if (existing) {
      return existing;
    }

    return this.notificationRepository.upsertPreferences(userId, {});
  }

  async updatePreferencesForUser(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreference> {
    if (dto.smsRemindersEnabled === true) {
      const user = await this.usersService.findOneById(userId);
      if (!user.phone) {
        throw new BadRequestException(
          'A verified phone number is required to enable SMS notifications',
        );
      }
    }

    return this.notificationRepository.upsertPreferences(userId, dto);
  }

  // methods for notification creation
  async createTripReminder24h(
    userId: string,
    payload: TripReminderPayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationCreateProvider.createTripReminder24h(
      userId,
      payload,
      channel,
    );
  }

  async createTripReminder3h(
    userId: string,
    payload: TripReminderPayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationCreateProvider.createTripReminder3h(
      userId,
      payload,
      channel,
    );
  }

  async createTripLiveUpdate(
    userId: string,
    payload: TripLiveUpdatePayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationCreateProvider.createTripLiveUpdate(
      userId,
      payload,
      channel,
    );
  }

  async createBookingConfirmation(
    userId: string,
    payload: BookingConfirmationPayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationCreateProvider.createBookingConfirmation(
      userId,
      payload,
      channel,
    );
  }

  async createBookingIncomplete(
    userId: string,
    payload: BookingIncompletePayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationCreateProvider.createBookingIncomplete(
      userId,
      payload,
      channel,
    );
  }

  async processReminderWindow(options: {
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
    console.log('window start: ', windowStart);
    console.log('window end: ', windowEnd);
    console.log('booking for reminders: ', bookings);

    let sent = 0;
    let skippedPrefs = 0;
    let skippedMissingContact = 0;
    let skippedDuplicate = 0;

    for (const booking of bookings) {
      if (booking.userId) {
        const prefs = await this.getPreferencesForUser(booking.userId);
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

      const emailPayload =
        this.notificationReminderPayloadProvider.buildReminderPayload(
          booking,
          options.reminderType,
        );

      if (booking.userId) {
        const baseReminderPayload = {
          tripId: booking.trip?.id ?? '',
          departureTime: booking.trip?.departureTime?.toISOString?.() || '',
          from: booking.trip?.route?.origin || '—',
          to: booking.trip?.route?.destination || '—',
          bookingId: booking.id,
          seats: emailPayload.seats ?? [],
        };

        if (options.reminderType === '24h') {
          await this.notificationCreateProvider.createTripReminder24h(
            booking.userId,
            baseReminderPayload,
          );
        } else {
          await this.notificationCreateProvider.createTripReminder3h(
            booking.userId,
            baseReminderPayload,
          );
        }
      }

      await this.bookingEmailProvider.sendTripReminderEmail(to, emailPayload);
      sent++;
    }

    return {
      windowStart,
      windowEnd,
      totalBookings: bookings.length,
      sent,
      skippedPrefs,
      skippedMissingContact,
      skippedDuplicate,
    };
  }

  // List notifications with pagination
  async getNotifications(
    userId: string,
    options: {
      status?: NotificationStatus;
      page: number;
      limit: number;
    },
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  }> {
    const [notifications, total] =
      await this.notificationRepository.findNotificationsByUserPaginated(
        userId,
        options,
      );

    const unreadCount =
      await this.notificationRepository.countUnreadByUser(userId);

    return {
      data: notifications,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
      unreadCount,
    };
  }

  // Mark notifications as read
  async markNotificationsAsRead(
    userId: string,
    notificationIds: string[],
  ): Promise<{ affected: number }> {
    const affected = await this.notificationRepository.markMultipleAsRead(
      userId,
      notificationIds,
    );
    return { affected };
  }

  // Mark all notifications as read for a user
  async markAllNotificationsAsRead(
    userId: string,
  ): Promise<{ affected: number }> {
    const affected = await this.notificationRepository.markAllAsRead(userId);
    return { affected };
  }

  // Delete single notification
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const result = await this.notificationRepository.deleteNotification(
      notificationId,
      userId,
    );
    return { success: result.affected > 0 };
  }

  // Delete multiple notifications
  async deleteNotifications(
    userId: string,
    notificationIds: string[],
  ): Promise<{ affected: number }> {
    const affected =
      await this.notificationRepository.deleteMultipleNotifications(
        notificationIds,
        userId,
      );
    return { affected };
  }
}
