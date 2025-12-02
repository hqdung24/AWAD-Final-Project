import { z } from 'zod';
import { RouteSchema, BusSchema, SeatStatusSchema } from './common.schemas';

// Trip Item Schema (with availableSeatsCount)
const TripItemSchema = z.object({
  id: z.string().uuid(),
  routeId: z.string().uuid(),
  busId: z.string().uuid(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  basePrice: z.string(),
  status: z.string(),
  route: RouteSchema,
  bus: BusSchema,
  seatStatuses: z.array(SeatStatusSchema),
  availableSeatsCount: z.number(),
});

// Pagination Data Schema
const TripListDataSchema = z.object({
  data: z.array(TripItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Trip List Response Schema
export const TripListResponseSchema = z.object({
  data: TripListDataSchema,
});

// Types
export type TripItem = z.infer<typeof TripItemSchema>;
export type TripListData = z.infer<typeof TripListDataSchema>;
export type TripListResponse = z.infer<typeof TripListResponseSchema>;
