import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteNotifications,
  getMyNotificationPreferences,
  updateMyNotificationPreferences,
} from '@/services/notificationService';
import { notify } from '@/lib/notify';
import { extractApiError } from '@/lib/api-error';
import type {
  NotificationListQueryParams,
  NotificationListResponse,
} from '@/schemas/notification/notification';
import type { UpdateNotificationPreferences } from '@/schemas/notification/preferences';

export function useNotification(params?: NotificationListQueryParams) {
  const queryClient = useQueryClient();
  const notificationListKey = [
    'notifications',
    params?.status ?? '',
    params?.page ?? 1,
    params?.limit ?? 20,
  ] as const;

  // Query: Get notifications list
  const notificationListQuery = useQuery({
    queryKey: notificationListKey,
    queryFn: () => getNotifications(params),
  });

  // Query: Get notification preferences
  const preferencesQuery = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => getMyNotificationPreferences(),
  });

  // Mutation: Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to mark notification as read');
    },
  });

  // Mutation: Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onMutate: () => {
      // Optimistic update before server response
      optimisticMarkAllAsRead();
    },
    onSuccess: (data) => {
      notify.success(`${data.affected} notification(s) marked as read`);
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to mark all notifications as read');
      // Revert optimistic update on error
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mutation: Delete single notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      notify.success('Notification deleted successfully');
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to delete notification');
    },
  });

  // Mutation: Delete multiple notifications
  const deleteNotificationsMutation = useMutation({
    mutationFn: (notificationIds: string[]) =>
      deleteNotifications(notificationIds),
    onSuccess: (data) => {
      notify.success(`${data.affected} notification(s) deleted`);
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to delete notifications');
    },
  });

  // Mutation: Update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: (payload: UpdateNotificationPreferences) =>
      updateMyNotificationPreferences(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences'], data);
      notify.success('Notification preferences updated successfully');
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to update notification preferences');
    },
  });

  // Helper: Optimistic update for marking as read
  const optimisticMarkAsRead = (notificationId: string) => {
    queryClient.setQueryData<NotificationListResponse>(
      notificationListKey,
      (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  status: 'read' as const,
                  readAt: new Date().toISOString(),
                }
              : notification
          ),
          unreadCount: Math.max(0, old.unreadCount - 1),
        };
      }
    );
  };

  // Helper: Optimistic update for marking all as read
  const optimisticMarkAllAsRead = () => {
    queryClient.setQueryData<NotificationListResponse>(
      notificationListKey,
      (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((notification) => ({
            ...notification,
            status: 'read' as const,
            readAt: new Date().toISOString(),
          })),
          unreadCount: 0,
        };
      }
    );
  };

  // Helper: Optimistic update for deleting notification
  const optimisticDelete = (notificationId: string) => {
    queryClient.setQueryData<NotificationListResponse>(
      ['notifications', params ?? {}],
      (old) => {
        if (!old) return old;
        const deletedNotification = old.data.find(
          (n) => n.id === notificationId
        );
        const isUnread = deletedNotification?.status !== 'read';
        return {
          ...old,
          data: old.data.filter(
            (notification) => notification.id !== notificationId
          ),
          total: Math.max(0, old.total - 1),
          unreadCount: isUnread
            ? Math.max(0, old.unreadCount - 1)
            : old.unreadCount,
        };
      }
    );
  };

  return {
    // Queries
    notificationList: notificationListQuery,
    preferences: preferencesQuery,

    // Mutations
    markAsRead: markAsReadMutation,
    markAllAsRead: markAllAsReadMutation,
    deleteNotification: deleteNotificationMutation,
    deleteNotifications: deleteNotificationsMutation,
    updatePreferences: updatePreferencesMutation,

    // Optimistic updates
    optimisticMarkAsRead,
    optimisticMarkAllAsRead,
    optimisticDelete,
  };
}
