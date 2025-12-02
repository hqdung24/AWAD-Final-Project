import { z } from 'zod';

// Route Schema
export const RouteSchema = z.object({
  id: z.string().uuid(),
  operatorId: z.string().uuid(),
  origin: z.string(),
  destination: z.string(),
  distanceKm: z.number(),
  estimatedMinutes: z.number(),
  isActive: z.boolean(),
  deletedAt: z.string().nullable(),
});

// Bus Schema
export const BusSchema = z.object({
  id: z.string().uuid(),
  operatorId: z.string().uuid(),
  plateNumber: z.string(),
  model: z.string(),
  seatCapacity: z.number(),
  amenitiesJson: z.string(),
  isActive: z.boolean(),
  deletedAt: z.string().nullable(),
});

// Seat Status Schema
export const SeatStatusSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  seatId: z.string().uuid(),
  state: z.enum(['available', 'locked', 'booked']),
  bookingId: z.string().uuid().nullable(),
  lockedUntil: z.string().nullable(),
});

// Types
export type Route = z.infer<typeof RouteSchema>;
export type Bus = z.infer<typeof BusSchema>;
export type SeatStatus = z.infer<typeof SeatStatusSchema>;
