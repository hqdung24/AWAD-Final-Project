export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  READ = 'read', // important for in-app
}

export enum NotificationType {
  TRIP_REMINDER_24H = 'trip_reminder_24h',
  TRIP_REMINDER_3H = 'trip_reminder_3h',
  TRIP_LIVE_UPDATE = 'trip_live_update',
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_INCOMPLETE = 'booking_incomplete',
}
