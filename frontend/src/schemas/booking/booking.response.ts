import { z } from 'zod';

// Seat info schema
export const seatInfoSchema = z.object({
  seatId: z.string().uuid(),
  seatCode: z.string(),
});

// Passenger info schema
export const passengerInfoSchema = z.object({
  fullName: z.string(),
  documentId: z.string(),
  seatCode: z.string(),
  phone: z.string().optional(),
});

// Create booking success response schema
export const createBookingResponseSchema = z.object({
  bookingId: z.string().uuid(),
  tripId: z.string().uuid(),
  status: z.enum(['pending', 'paid', 'cancelled', 'expired']),
  seats: z.array(seatInfoSchema),
  passengers: z.array(passengerInfoSchema),
  totalAmount: z.number(),
  paymentMethodId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
});

// Error response schema
export const createBookingErrorResponseSchema = z.object({
  message: z.string(),
  seat: z.string().optional(),
  code: z.string().optional(),
});

// Type inference
export type SeatInfo = z.infer<typeof seatInfoSchema>;
export type PassengerInfo = z.infer<typeof passengerInfoSchema>;
export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;
export type CreateBookingErrorResponse = z.infer<
  typeof createBookingErrorResponseSchema
>;
