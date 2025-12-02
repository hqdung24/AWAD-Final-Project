import { z } from 'zod';
import { RouteSchema, BusSchema, SeatStatusSchema } from './common.schemas';

// Trip Detail Schema
const TripDetailDataSchema = z.object({
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
});

// Trip Detail Response Schema
export const TripDetailResponseSchema = z.object({
  data: TripDetailDataSchema,
});

// Types
export type TripDetailData = z.infer<typeof TripDetailDataSchema>;
export type TripDetailResponse = z.infer<typeof TripDetailResponseSchema>;
