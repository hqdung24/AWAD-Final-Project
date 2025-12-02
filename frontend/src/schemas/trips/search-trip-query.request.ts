import { z } from 'zod';

export const SearchTripQuerySchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  date: z.string().optional(), // YYYY-MM-DD format
  passengers: z.number().min(1).max(50).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  timeSlots: z
    .array(z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']))
    .optional(),
  busTypes: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  sortBy: z
    .enum([
      'PRICE_ASC',
      'PRICE_DESC',
      'TIME_ASC',
      'TIME_DESC',
      'DURATION_ASC',
      'DURATION_DESC',
    ])
    .optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type SearchTripQuery = z.infer<typeof SearchTripQuerySchema>;
