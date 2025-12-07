import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createBooking,
  getBookingDetail,
  getBookings,
} from '@/services/bookingService';
import { notify } from '@/lib/notify';
import { extractApiError } from '@/lib/api-error';
import type { BookingListQuery, CreateBookingRequest } from '@/schemas/booking';

export function useBooking(params?: BookingListQuery, bookingId?: string) {
  const createBookingMutation = useMutation({
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

  const bookingListQuery = useQuery({
    queryKey: ['bookings', params ?? {}],
    queryFn: () => getBookings(params ?? {}),
    enabled: params !== undefined,
  });

  const bookingDetailQuery = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingDetail(bookingId!),
    enabled: !!bookingId,
  });

  return {
    createBooking: createBookingMutation,
    bookingList: bookingListQuery,
    bookingDetail: bookingDetailQuery,
  };
}
