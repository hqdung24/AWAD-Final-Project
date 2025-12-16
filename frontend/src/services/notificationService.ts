import { http } from '@/lib/http';
import {
  NotificationPreferencesSchema,
  UpdateNotificationPreferencesSchema,
  type NotificationPreferences,
  type UpdateNotificationPreferences,
} from '@/schemas/notification/preferences';

export async function getMyNotificationPreferences(): Promise<NotificationPreferences> {
  const res = await http.get('/notification/preferences/me');
  return NotificationPreferencesSchema.parse(res.data);
}

export async function updateMyNotificationPreferences(
  payload: UpdateNotificationPreferences,
): Promise<NotificationPreferences> {
  UpdateNotificationPreferencesSchema.parse(payload);
  const res = await http.patch('/notification/preferences', payload);
  return NotificationPreferencesSchema.parse(res.data);
}
