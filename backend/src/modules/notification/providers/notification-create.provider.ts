import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../notification.repository';
import {
  BookingConfirmationPayloadDto,
  BookingIncompletePayloadDto,
  TripLiveUpdatePayloadDto,
  TripReminderPayloadDto,
} from '../dto/create-notification.dto';
import {
  NotificationChannel,
  NotificationType,
} from '../enums/notification.enum';

@Injectable()
export class NotificationCreateProvider {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async createTripReminder24h(
    userId: string,
    payload: TripReminderPayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationRepository.createNotification({
      userId,
      channel,
      type: NotificationType.TRIP_REMINDER_24H,
      payload,
      bookingId: payload.bookingId,
      sentAt: new Date(),
    });
  }

  async createTripReminder3h(
    userId: string,
    payload: TripReminderPayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationRepository.createNotification({
      userId,
      channel,
      type: NotificationType.TRIP_REMINDER_3H,
      payload,
      bookingId: payload.bookingId,
      sentAt: new Date(),
    });
  }

  async createTripLiveUpdate(
    userId: string,
    payload: TripLiveUpdatePayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationRepository.createNotification({
      userId,
      channel,
      type: NotificationType.TRIP_LIVE_UPDATE,
      payload,
      bookingId: payload.bookingId,
      sentAt: new Date(),
    });
  }

  async createBookingConfirmation(
    userId: string,
    payload: BookingConfirmationPayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationRepository.createNotification({
      userId,
      channel,
      type: NotificationType.BOOKING_CONFIRMATION,
      payload,
      bookingId: payload.bookingId,
      sentAt: new Date(),
    });
  }

  async createBookingIncomplete(
    userId: string,
    payload: BookingIncompletePayloadDto,
    channel: NotificationChannel = NotificationChannel.IN_APP,
  ) {
    return this.notificationRepository.createNotification({
      userId,
      channel,
      type: NotificationType.BOOKING_INCOMPLETE,
      payload,
      bookingId: payload.bookingId,
      sentAt: new Date(),
    });
  }
}
