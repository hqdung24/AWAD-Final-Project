import {
  NotificationChannel,
  NotificationType,
} from '../enums/notification.enum';
import { NotificationPayloadSchema } from './create-notification.dto';

export type NotificationCreateEventPayload = {
  userId: string;
  type: NotificationType;
  payload: NotificationPayloadSchema[NotificationType];
  channel?: NotificationChannel;
};
