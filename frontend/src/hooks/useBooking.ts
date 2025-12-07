import { useMutation } from '@tanstack/react-query';
import { createBooking } from '@/services/bookingService';
import { notify } from '@/lib/notify';
import { extractApiError } from '@/lib/api-error';
import type { CreateBookingRequest } from '@/schemas/booking';

/**
 * Hook to create a new booking with lock token validation
 * @returns Mutation object with mutate, data, error, isPending, etc.
 *
 * @example
 * ```tsx
 * const { mutate, data, isPending } = useCreateBooking();
 *
 * const handleBooking = () => {
 *   mutate({
 *     lockToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *     passengers: [
 *       {
 *         fullName: 'Nguyen Van A',
 *         documentId: '0123456789',
 *         phone: '0909123456',
 *         seatCode: 'A1'
 *       }
 *     ],
 *     contactInfo: {
 *       name: 'Nguyen Van A',
 *       email: 'nguyenvana@gmail.com',
 *       phone: '0909123456'
 *     },
 *     paymentMethodId: 'uuid-here'
 *   });
 * };
 * ```
 */
export function useCreateBooking() {
  return useMutation({
    mutationFn: (payload: CreateBookingRequest) => createBooking(payload),
    onSuccess: (data) => {
      notify.success(
        `Booking created successfully! Navigating to payment for booking ID: ${data.bookingId}`
      );
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to create booking 😢');
    },
  });
}
