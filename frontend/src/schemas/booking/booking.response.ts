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

export const tripBriefSchema = z.object({
  id: z.string().uuid(),
  routeId: z.string().uuid(),
  origin: z.string(),
  destination: z.string(),
  busId: z.string().uuid(),
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
  basePrice: z.number(),
  status: z.string(),
});

export const routePointSelectionSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  name: z.string(),
  address: z.string(),
  orderIndex: z.number(),
});

// Create booking success response schema
export const createBookingResponseSchema = z.object({
  bookingId: z.string().uuid(),
  tripId: z.string().uuid(),
  status: z.enum(['pending', 'paid', 'cancelled', 'expired']),
  userId: z.string().nullable(),
  bookingReference: z.string().nullable(),
  seats: z.array(seatInfoSchema),
  passengers: z.array(passengerInfoSchema),
  totalAmount: z.number(),
  paymentMethodId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  pickupPoint: routePointSelectionSchema.nullable().optional(),
  dropoffPoint: routePointSelectionSchema.nullable().optional(),
});

export const bookingListItemSchema = z.object({
  id: z.string().uuid(),
  tripId: z.string().uuid(),
  userId: z.string().nullable(),
  bookingReference: z.string().nullable(),
  status: z.enum(['pending', 'paid', 'cancelled', 'expired']),
  totalAmount: z.number(),
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  createdAt: z.string().datetime(),
  trip: tripBriefSchema,
  seats: z.array(seatInfoSchema),
  passengers: z.array(passengerInfoSchema),
  pickupPoint: routePointSelectionSchema.nullable().optional(),
  dropoffPoint: routePointSelectionSchema.nullable().optional(),
});

export const bookingListResponseSchema = z.object({
  data: z.array(bookingListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const bookingDetailResponseSchema = z.object({
  bookingId: z.string().uuid(),
  tripId: z.string().uuid(),
  userId: z.string().nullable(),
  bookingReference: z.string().nullable(),
  status: z.enum(['pending', 'paid', 'cancelled', 'expired']),
  trip: tripBriefSchema,
  seats: z.array(seatInfoSchema),
  passengers: z.array(passengerInfoSchema),
  totalAmount: z.number(),
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  createdAt: z.string().datetime(),
  pickupPoint: routePointSelectionSchema.nullable().optional(),
  dropoffPoint: routePointSelectionSchema.nullable().optional(),
  ticketVerifyUrl: z.string().optional().nullable(),
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
export type TripBrief = z.infer<typeof tripBriefSchema>;
export type RoutePointSelection = z.infer<typeof routePointSelectionSchema>;
export type BookingListItem = z.infer<typeof bookingListItemSchema>;
export type BookingListResponse = z.infer<typeof bookingListResponseSchema>;
export type BookingDetailResponse = z.infer<typeof bookingDetailResponseSchema>;
