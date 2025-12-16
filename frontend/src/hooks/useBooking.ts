import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createBooking,
  cancelBooking,
  getBookingDetail,
  getBookings,
  updateBooking,
  changeBookingSeats,
} from '@/services/bookingService';
import { notify } from '@/lib/notify';
import { extractApiError } from '@/lib/api-error';
import type {
  BookingListQuery,
  CreateBookingRequest,
  BookingDetailResponse,
} from '@/schemas/booking';
import type { SeatChange, UpdateBookingRequest } from '@/services/bookingService';
import { useQueryClient } from '@tanstack/react-query';

export function useBooking(params?: BookingListQuery, bookingId?: string) {
  const queryClient = useQueryClient();

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

  const cancelBookingMutation = useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: (data: BookingDetailResponse) => {
      notify.success('Booking cancelled successfully');
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({
        queryKey: ['booking', data.bookingId],
      });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to cancel booking');
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateBookingRequest;
    }) => updateBooking(id, payload),
    onSuccess: (data: BookingDetailResponse) => {
      notify.success('Booking updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({
        queryKey: ['booking', data.bookingId],
      });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to update booking');
    },
  });

  const changeSeatsMutation = useMutation({
    mutationFn: ({
      id,
      seatChanges,
    }: {
      id: string;
      seatChanges: SeatChange[];
    }) => changeBookingSeats(id, seatChanges),
    onSuccess: (data: BookingDetailResponse) => {
      notify.success('Seats updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({
        queryKey: ['booking', data.bookingId],
      });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to update seats');
    },
  });

  return {
    createBooking: createBookingMutation,
    bookingList: bookingListQuery,
    bookingDetail: bookingDetailQuery,
    cancelBooking: cancelBookingMutation,
    updateBooking: updateBookingMutation,
    changeSeats: changeSeatsMutation,
  };
}
