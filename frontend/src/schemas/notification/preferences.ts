import { z } from 'zod';

export const NotificationPreferencesSchema = z.object({
  emailRemindersEnabled: z.boolean(),
  smsRemindersEnabled: z.boolean(),
  updatedAt: z.string().optional(),
});

export type NotificationPreferences = z.infer<
  typeof NotificationPreferencesSchema
>;

export const UpdateNotificationPreferencesSchema = z.object({
  emailRemindersEnabled: z.boolean().optional(),
  smsRemindersEnabled: z.boolean().optional(),
});

export type UpdateNotificationPreferences = z.infer<
  typeof UpdateNotificationPreferencesSchema
>;
