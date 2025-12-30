import { z } from 'zod';

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

// Payload Zod schemas
export const TripReminderPayloadSchema = z.object({
  tripId: z.string(),
  departureTime: z.string(),
  from: z.string(),
  to: z.string(),
  bookingId: z.string().optional(),
  seats: z.array(z.string()),
});

export const TripLiveUpdatePayloadSchema = z.object({
  tripId: z.string(),
  message: z.string(),
  bookingId: z.string().optional(),
});

export const BookingConfirmationPayloadSchema = z.object({
  bookingId: z.string(),
  bookingRef: z.string(),
  tripId: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  seats: z.array(z.string()),
  departureTime: z.string(),
});

export const BookingIncompletePayloadSchema = z.object({
  bookingId: z.string(),
  tripId: z.string(),
  bookingRef: z.string(),
  bookingStatus: z.string(),
  resumeUrl: z.string(),
  expiresAt: z.string(),
});

// Payload types for each notification type
export type TripReminderPayload = z.infer<typeof TripReminderPayloadSchema>;
export type TripLiveUpdatePayload = z.infer<typeof TripLiveUpdatePayloadSchema>;
export type BookingConfirmationPayload = z.infer<
  typeof BookingConfirmationPayloadSchema
>;
export type BookingIncompletePayload = z.infer<
  typeof BookingIncompletePayloadSchema
>;

export type NotificationPayloadSchema = {
  [NotificationType.TRIP_REMINDER_24H]: TripReminderPayload;
  [NotificationType.TRIP_REMINDER_3H]: TripReminderPayload;
  [NotificationType.TRIP_LIVE_UPDATE]: TripLiveUpdatePayload;
  [NotificationType.BOOKING_CONFIRMATION]: BookingConfirmationPayload;
  [NotificationType.BOOKING_INCOMPLETE]: BookingIncompletePayload;
};

// Main notification entity Zod schema
export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  channel: z.enum([
    NotificationChannel.EMAIL,
    NotificationChannel.SMS,
    NotificationChannel.IN_APP,
  ]),
  type: z.enum([
    NotificationType.TRIP_REMINDER_24H,
    NotificationType.TRIP_REMINDER_3H,
    NotificationType.TRIP_LIVE_UPDATE,
    NotificationType.BOOKING_CONFIRMATION,
    NotificationType.BOOKING_INCOMPLETE,
  ]),
  status: z.enum([
    NotificationStatus.PENDING,
    NotificationStatus.SENT,
    NotificationStatus.FAILED,
    NotificationStatus.READ,
  ]),
  payload: z.unknown(),
  sentAt: z.string().nullable().optional(),
  readAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Query parameters schema
export const NotificationListQueryParamsSchema = z.object({
  status: z
    .enum([
      NotificationStatus.PENDING,
      NotificationStatus.SENT,
      NotificationStatus.FAILED,
      NotificationStatus.READ,
    ])
    .optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type NotificationListQueryParams = z.infer<
  typeof NotificationListQueryParamsSchema
>;

// Response schemas
export const NotificationListResponseSchema = z.object({
  data: z.array(NotificationSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  unreadCount: z.number(),
});

export type NotificationListResponse = z.infer<
  typeof NotificationListResponseSchema
>;

export const MarkAsReadResponseSchema = z.object({
  affected: z.number(),
  message: z.string(),
});

export type MarkAsReadResponse = z.infer<typeof MarkAsReadResponseSchema>;

export const DeleteNotificationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type DeleteNotificationResponse = z.infer<
  typeof DeleteNotificationResponseSchema
>;

export const DeleteMultipleNotificationsResponseSchema = z.object({
  affected: z.number(),
  message: z.string(),
});

export type DeleteMultipleNotificationsResponse = z.infer<
  typeof DeleteMultipleNotificationsResponseSchema
>;

export const MarkAsReadRequestSchema = z.object({
  notificationIds: z.array(z.string()),
});

export type MarkAsReadRequest = z.infer<typeof MarkAsReadRequestSchema>;

// WebSocket notification event
export interface NotificationCreatedEvent {
  type: NotificationType;
  payload: NotificationPayloadSchema[NotificationType];
  channel?: NotificationChannel;
  timestamp: Date;
}

// API response types (deprecated, use schemas above)
export interface GetNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}
