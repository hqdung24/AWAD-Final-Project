import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bell,
  Bus,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Settings,
  ChevronLeft,
  ChevronRight,
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
import { useNavigate } from 'react-router';
import { NotificationPreferencesModal } from '@/components/layout/NotificationPreferencesModal';

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
      return '/account/notifications';
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

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const {
    notificationList,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteNotifications,
  } = useNotification({
    page,
    limit: 20,
  });

  const navigate = useNavigate();

  const notifications = notificationList.data?.data || [];
  const unreadCount = notificationList.data?.unreadCount || 0;
  const totalPages = notificationList.data?.totalPages || 1;
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
    navigate(actionLink);
  };

  return (
    <div className="bg-background p-6 flex flex-col gap-4 overflow-hidden">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Notifications</CardTitle>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  You have {unreadCount} unread notification
                  {unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreferencesOpen(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAll}
                  disabled={deleteNotifications.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete all
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-semibold mb-1">No notifications</p>
              <p className="text-sm text-muted-foreground">
                You're all caught up!
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative flex gap-3 p-4 mb-2 hover:bg-muted/50 transition-colors cursor-pointer rounded-lg ${
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
                        {getNotificationMessage(notification)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <NotificationPreferencesModal
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />
    </div>
  );
}
