import { http } from '@/lib/http';
import {
  NotificationPreferencesSchema,
  UpdateNotificationPreferencesSchema,
  type NotificationPreferences,
  type UpdateNotificationPreferences,
} from '@/schemas/notification/preferences';
import {
  NotificationListResponseSchema,
  MarkAsReadResponseSchema,
  DeleteNotificationResponseSchema,
  DeleteMultipleNotificationsResponseSchema,
  NotificationListQueryParamsSchema,
  type NotificationListResponse,
  type MarkAsReadResponse,
  type DeleteNotificationResponse,
  type DeleteMultipleNotificationsResponse,
  type NotificationListQueryParams,
} from '@/schemas/notification/notification';

// Get notifications list with pagination
export async function getNotifications(
  params?: NotificationListQueryParams
): Promise<NotificationListResponse> {
  const validatedParams = NotificationListQueryParamsSchema.parse(params || {});
  const res = await http.get<NotificationListResponse>('/notification', {
    params: {
      page: validatedParams.page,
      limit: validatedParams.limit,
      ...(validatedParams.status && { status: validatedParams.status }),
    },
  });
  return NotificationListResponseSchema.parse(res.data);
}

// Mark single notification as read
export async function markNotificationAsRead(
  notificationId: string
): Promise<MarkAsReadResponse> {
  const res = await http.post<MarkAsReadResponse>(
    '/notification/mark-as-read',
    {
      notificationIds: [notificationId],
    }
  );
  return MarkAsReadResponseSchema.parse(res.data);
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<MarkAsReadResponse> {
  const res = await http.post<MarkAsReadResponse>(
    '/notification/mark-all-as-read'
  );
  return MarkAsReadResponseSchema.parse(res.data);
}

// Delete single notification
export async function deleteNotification(
  notificationId: string
): Promise<DeleteNotificationResponse> {
  const res = await http.delete<DeleteNotificationResponse>(
    `/notification/${notificationId}`
  );
  return DeleteNotificationResponseSchema.parse(res.data);
}

// Delete multiple notifications
export async function deleteNotifications(
  notificationIds: string[]
): Promise<DeleteMultipleNotificationsResponse> {
  const res = await http.post<DeleteMultipleNotificationsResponse>(
    '/notification/delete-multiple',
    {
      notificationIds,
    }
  );
  return DeleteMultipleNotificationsResponseSchema.parse(res.data);
}

export async function getMyNotificationPreferences(): Promise<NotificationPreferences> {
  const res = await http.get('/notification/preferences/me');
  return NotificationPreferencesSchema.parse(res.data);
}

export async function updateMyNotificationPreferences(
  payload: UpdateNotificationPreferences
): Promise<NotificationPreferences> {
  UpdateNotificationPreferencesSchema.parse(payload);
  const res = await http.patch('/notification/preferences', payload);
  return NotificationPreferencesSchema.parse(res.data);
}
