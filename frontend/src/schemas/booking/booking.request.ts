import { z } from 'zod';

// Passenger schema
export const passengerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  documentId: z
    .string()
    .min(9, 'Document ID must be at least 9 digits')
    .max(12, 'Document ID must not exceed 12 digits')
    .regex(/^[0-9]+$/, 'Document ID must contain only digits'),
  phone: z
    .string()
    .regex(/^0[0-9]{9,10}$/, 'Invalid Vietnamese phone number format')
    .optional(),
  seatCode: z.string().min(1, 'Seat code is required'),
});

// Contact info schema
export const contactInfoSchema = z.object({
  name: z
    .string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name must not exceed 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^0[0-9]{9,10}$/, 'Invalid Vietnamese phone number format'),
});

// Create booking request schema
export const createBookingRequestSchema = z.object({
  lockToken: z.string().min(1, 'Lock token is required'),
  passengers: z
    .array(passengerSchema)
    .min(1, 'At least one passenger is required'),
  contactInfo: contactInfoSchema,
  paymentMethodId: z.string().uuid('Invalid payment method ID').optional(),
  userId: z.string().optional(), // Optional user ID for authenticated users
});

// Type inference
export type PassengerRequest = z.infer<typeof passengerSchema>;
export type ContactInfoRequest = z.infer<typeof contactInfoSchema>;
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;
