import { z } from 'zod';

export const bookingListQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  userId: z.string().uuid().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;
