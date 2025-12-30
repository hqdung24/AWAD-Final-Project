export const NotificationChannel = {
  EMAIL: 'email',
  SMS: 'sms',
  IN_APP: 'in_app',
} as const;

export type NotificationChannel =
  (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  READ: 'read',
} as const;

export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NotificationType = {
  TRIP_REMINDER_24H: 'trip_reminder_24h',
  TRIP_REMINDER_3H: 'trip_reminder_3h',
  TRIP_LIVE_UPDATE: 'trip_live_update',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  BOOKING_INCOMPLETE: 'booking_incomplete',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

// Payload types for each notification type
export interface TripReminderPayload {
  tripId: string;
  departureTime: string;
  from: string;
  to: string;
  bookingId?: string;
  seats: string[];
}

export interface TripLiveUpdatePayload {
  tripId: string;
  message: string;
  bookingId?: string;
}

export interface BookingConfirmationPayload {
  bookingId: string;
  tripId: string;
  totalAmount: number;
  currency: string;
  seats: string[];
  departureTime: string;
}

export interface BookingIncompletePayload {
  bookingId: string;
  tripId: string;
  resumeUrl: string;
  expiresAt: string;
}

export type NotificationPayloadSchema = {
  [NotificationType.TRIP_REMINDER_24H]: TripReminderPayload;
  [NotificationType.TRIP_REMINDER_3H]: TripReminderPayload;
  [NotificationType.TRIP_LIVE_UPDATE]: TripLiveUpdatePayload;
  [NotificationType.BOOKING_CONFIRMATION]: BookingConfirmationPayload;
  [NotificationType.BOOKING_INCOMPLETE]: BookingIncompletePayload;
};

// Main notification entity
export interface Notification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  type: NotificationType;
  status: NotificationStatus;
  payload: NotificationPayloadSchema[NotificationType];
  sentAt: string | null;
  readAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// WebSocket notification event
export interface NotificationCreatedEvent {
  type: NotificationType;
  payload: NotificationPayloadSchema[NotificationType];
  channel?: NotificationChannel;
  timestamp: Date;
}

// API response types
export interface GetNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface MarkAsReadResponse {
  success: boolean;
  notification?: Notification;
}
