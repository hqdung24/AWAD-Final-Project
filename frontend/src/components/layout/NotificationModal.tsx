import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Bus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import {
  type Notification,
  NotificationType,
  NotificationStatus,
  NotificationChannel,
  type TripReminderPayload,
  type BookingConfirmationPayload,
  type TripLiveUpdatePayload,
  type BookingIncompletePayload,
} from '@/schemas/notification/notification';

const now = Date.now();

//Mock notification data matching backend structure with richer copy
const mockNotifications: Notification[] = [
  {
    id: 'notif_booking_confirmed',
    userId: 'user_123',
    channel: NotificationChannel.IN_APP,
    type: NotificationType.BOOKING_CONFIRMATION,
    status: NotificationStatus.SENT,
    payload: {
      bookingId: 'BK-2025-00045',
      tripId: 'trip-hcm-hue-0105',
      totalAmount: 1245000,
      currency: 'VND',
      seats: ['12A', '12B'],
      departureTime: new Date(now + 48 * 60 * 60 * 1000).toISOString(),
    },
    sentAt: new Date(now - 15 * 60 * 1000).toISOString(),
    readAt: null,
  },
  {
    id: 'notif_reminder_24h',
    userId: 'user_123',
    channel: NotificationChannel.IN_APP,
    type: NotificationType.TRIP_REMINDER_24H,
    status: NotificationStatus.SENT,
    payload: {
      tripId: 'trip-hcm-dl-0102',
      departureTime: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      from: 'Ho Chi Minh City',
      to: 'Da Lat',
      bookingId: 'BK-2025-00012',
      seats: ['A3'],
    },
    sentAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    readAt: null,
  },
  {
    id: 'notif_live_update',
    userId: 'user_123',
    channel: NotificationChannel.IN_APP,
    type: NotificationType.TRIP_LIVE_UPDATE,
    status: NotificationStatus.READ,
    payload: {
      tripId: 'trip-hanoi-danang-1229',
      message:
        'Your bus is departing 10 minutes late due to traffic near My Dinh.',
      bookingId: 'BK-2024-00221',
    },
    sentAt: new Date(now - 45 * 60 * 1000).toISOString(),
    readAt: new Date(now - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_booking_incomplete',
    userId: 'user_123',
    channel: NotificationChannel.IN_APP,
    type: NotificationType.BOOKING_INCOMPLETE,
    status: NotificationStatus.SENT,
    payload: {
      bookingId: 'BK-2025-00078',
      tripId: 'trip-hue-quangngai-0103',
      resumeUrl: '/bookings/BK-2025-00078/resume',
      expiresAt: new Date(now + 35 * 60 * 1000).toISOString(),
    },
    sentAt: new Date(now - 10 * 60 * 1000).toISOString(),
    readAt: null,
  },
  {
    id: 'notif_reminder_3h',
    userId: 'user_123',
    channel: NotificationChannel.IN_APP,
    type: NotificationType.TRIP_REMINDER_3H,
    status: NotificationStatus.SENT,
    payload: {
      tripId: 'trip-nhatrang-hanoi-1228',
      departureTime: new Date(now + 3 * 60 * 60 * 1000).toISOString(),
      from: 'Nha Trang',
      to: 'Hanoi',
      bookingId: 'BK-2024-00991',
      seats: ['B5', 'B6'],
    },
    sentAt: new Date(now - 20 * 60 * 1000).toISOString(),
    readAt: new Date(now - 5 * 60 * 1000).toISOString(),
  },
];

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.TRIP_REMINDER_24H:
    case NotificationType.TRIP_REMINDER_3H:
      return <Clock className="h-5 w-5 text-blue-500" />;
    case NotificationType.BOOKING_CONFIRMATION:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case NotificationType.TRIP_LIVE_UPDATE:
      return <Bus className="h-5 w-5 text-orange-500" />;
    case NotificationType.BOOKING_INCOMPLETE:
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getNotificationMessage = (notification: Notification): string => {
  switch (notification.type) {
    case NotificationType.TRIP_REMINDER_24H: {
      const payload = notification.payload as TripReminderPayload;
      return `Reminder: Your trip from ${payload.from} to ${payload.to} departs in 24 hours`;
    }
    case NotificationType.TRIP_REMINDER_3H: {
      const payload = notification.payload as TripReminderPayload;
      return `Reminder: Your trip from ${payload.from} to ${payload.to} departs in 3 hours`;
    }
    case NotificationType.BOOKING_CONFIRMATION: {
      const payload = notification.payload as BookingConfirmationPayload;
      return `Booking confirmed! Your seats ${payload.seats.join(
        ', '
      )} for ${new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: payload.currency,
      }).format(payload.totalAmount)}`;
    }
    case NotificationType.TRIP_LIVE_UPDATE: {
      const payload = notification.payload as TripLiveUpdatePayload;
      return payload.message;
    }
    case NotificationType.BOOKING_INCOMPLETE: {
      const payload = notification.payload as BookingIncompletePayload;
      return `Checkout for booking ${payload.bookingId} is not finished. Complete payment to keep your seats.`;
    }
    default:
      return 'New notification';
  }
};

const getNotificationOnClickAction = (notification: Notification): string => {
  switch (notification.type) {
    case NotificationType.TRIP_REMINDER_24H: {
      const link = `/trips/${
        (notification.payload as TripReminderPayload).tripId
      }`;
      return link;
    }
    case NotificationType.TRIP_REMINDER_3H: {
      const link = `/trips/${
        (notification.payload as TripReminderPayload).tripId
      }`;
      return link;
    }
    case NotificationType.BOOKING_CONFIRMATION: {
      const link = `/bookings/${
        (notification.payload as BookingConfirmationPayload).bookingId
      }`;
      return link;
    }
    case NotificationType.TRIP_LIVE_UPDATE: {
      const link = `/trips/${
        (notification.payload as { tripId: string }).tripId
      }`;
      return link;
    }
    case NotificationType.BOOKING_INCOMPLETE: {
      const { resumeUrl } = notification.payload as BookingIncompletePayload;
      return resumeUrl || '/bookings/incomplete';
    }
    default:
      return 'New notification';
  }
};

const formatTimeAgo = (dateString: string): string => {
  const now = Date.now();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
};

export const NotificationModal = () => {
  const unreadNotifications = mockNotifications.filter((n) => !n.readAt);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="lg" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-100 p-0 shadow-[-4px_4px_12px_rgba(0,0,0,0.15)]"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadNotifications.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          <div className="divide-y">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                  !notification.readAt ? 'bg-primary/5' : ''
                }`}
                onClick={() => {
                  const actionLink = getNotificationOnClickAction(notification);
                  console.log('Navigate to:', actionLink);
                }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getNotificationIcon(notification.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-tight">
                    <span className="text-muted-foreground">
                      {getNotificationMessage(notification)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(notification.sentAt!)}
                  </p>
                  {notification.type ===
                    NotificationType.BOOKING_INCOMPLETE && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 text-xs"
                      >
                        Complete Payment
                      </Button>
                    </div>
                  )}
                </div>
                {!notification.readAt && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-2">
          <Button variant="ghost" className="w-full text-xs h-8">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
