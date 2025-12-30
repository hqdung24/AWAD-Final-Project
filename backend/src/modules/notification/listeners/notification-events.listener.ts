import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationService } from '../notification.service';
import {
  NotificationChannel,
  NotificationType,
} from '../enums/notification.enum';
import { NotificationPayloadSchema } from '../dto/create-notification.dto';
import { type NotificationCreateEventPayload } from '../dto/notification-event.dto';

@Injectable()
export class NotificationEventsListener {
  private readonly logger = new Logger(NotificationEventsListener.name);

  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent('notification.create')
  async handleNotificationCreate(event: NotificationCreateEventPayload) {
    const channel = event.channel ?? NotificationChannel.IN_APP;

    try {
      switch (event.type) {
        case NotificationType.TRIP_REMINDER_24H:
          await this.notificationService.createTripReminder24h(
            event.userId,
            event.payload as NotificationPayloadSchema[NotificationType.TRIP_REMINDER_24H],
            channel,
          );
          break;
        case NotificationType.TRIP_REMINDER_3H:
          await this.notificationService.createTripReminder3h(
            event.userId,
            event.payload as NotificationPayloadSchema[NotificationType.TRIP_REMINDER_3H],
            channel,
          );
          break;
        case NotificationType.TRIP_LIVE_UPDATE:
          await this.notificationService.createTripLiveUpdate(
            event.userId,
            event.payload as NotificationPayloadSchema[NotificationType.TRIP_LIVE_UPDATE],
            channel,
          );
          break;
        case NotificationType.BOOKING_CONFIRMATION:
          await this.notificationService.createBookingConfirmation(
            event.userId,
            event.payload as NotificationPayloadSchema[NotificationType.BOOKING_CONFIRMATION],
            channel,
          );
          break;
        case NotificationType.BOOKING_INCOMPLETE:
          await this.notificationService.createBookingIncomplete(
            event.userId,
            event.payload as NotificationPayloadSchema[NotificationType.BOOKING_INCOMPLETE],
            channel,
          );
          break;
        default:
          this.logger.warn(`Unhandled notification type`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to handle notification.create for user ${event.userId}: ${errorMessage}`,
      );
      throw err;
    }
  }
}
