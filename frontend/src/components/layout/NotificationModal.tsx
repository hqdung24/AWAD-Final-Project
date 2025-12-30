import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Bus,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import {
  type Notification,
  NotificationType,
  NotificationStatus,
  type TripReminderPayload,
  type BookingConfirmationPayload,
  type TripLiveUpdatePayload,
  type BookingIncompletePayload,
} from '@/schemas/notification/notification';
import { useNotification } from '@/hooks/useNotification';
import { useState } from 'react';
import { useNavigate } from 'react-router';
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
      return `Booking ${
        payload.bookingRef
      } confirmed! Your seats ${payload.seats.join(
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
      const status = payload.bookingStatus.toLowerCase();
      if (status === 'pending') {
        return `Checkout for booking ${payload.bookingRef} is not finished. Complete payment to keep your seats.`;
      } else if (status === 'expired') {
        return `Your booking ${payload.bookingRef} has expired. Seats are released.`;
      } else {
        return `Your booking ${payload.bookingRef} is ${status}.`;
      }
    }
    default:
      return 'New notification';
  }
};

const getNotificationOnClickAction = (notification: Notification): string => {
  switch (notification.type) {
    case NotificationType.TRIP_REMINDER_24H: {
      const link = `/upcoming-trip/${
        (notification.payload as TripReminderPayload).tripId
      }`;
      return link;
    }
    case NotificationType.TRIP_REMINDER_3H: {
      const link = `/upcoming-trip/${
        (notification.payload as TripReminderPayload).tripId
      }`;
      return link;
    }
    case NotificationType.BOOKING_CONFIRMATION: {
      const link = `/upcoming-trip/${
        (notification.payload as BookingConfirmationPayload).bookingId
      }`;
      return link;
    }
    case NotificationType.TRIP_LIVE_UPDATE: {
      const link = `/upcoming-trip/${
        (notification.payload as TripLiveUpdatePayload).bookingId
      }`;
      return link;
    }
    case NotificationType.BOOKING_INCOMPLETE: {
      const link = `/upcoming-trip/${
        (notification.payload as BookingIncompletePayload).bookingId
      }`;
      return link;
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const {
    notificationList,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotifications,
  } = useNotification({
    page: 1,
    limit: 20,
  });
  const navigate = useNavigate();

  const notifications = notificationList.data?.data || [];
  const unreadCount = notificationList.data?.unreadCount || 0;
  const isLoading = notificationList.isLoading;

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(notificationId);
  };

  const handleDeleteAll = () => {
    const allIds = notifications.map((n) => n.id);
    if (allIds.length > 0) {
      deleteNotifications.mutate(allIds);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status !== NotificationStatus.READ) {
      handleMarkAsRead(notification.id);
    }
    const actionLink = getNotificationOnClickAction(notification);
    console.log('Navigate to:', actionLink);

    navigate(actionLink);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="lg" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
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
          <h3 className="font-semibold text-sm">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleDeleteAll}
                disabled={deleteNotifications.isPending}
              >
                Delete all
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    notification.status !== NotificationStatus.READ
                      ? 'bg-primary/5'
                      : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
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
                  </div>
                  <div className="flex items-start gap-2">
                    {notification.status !== NotificationStatus.READ && (
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    )}
                    {hoveredId === notification.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(notification.id, e)}
                        disabled={deleteNotification.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
