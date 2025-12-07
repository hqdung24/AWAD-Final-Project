import { http } from '@/lib/http';
import type {
  CreateBookingRequest,
  CreateBookingResponse,
  BookingListQuery,
  BookingListResponse,
  BookingDetailResponse,
} from '@/schemas/booking';

export async function createBooking(
  payload: CreateBookingRequest
): Promise<CreateBookingResponse> {
  const res = await http.post('/booking', payload);
  return (res as { data: CreateBookingResponse }).data;
}

export async function getBookings(
  params: BookingListQuery = {}
): Promise<BookingListResponse> {
  const res = await http.get('/booking', { params });
  // API wraps payload under data
  return (res as { data: BookingListResponse }).data;
}

export async function getBookingDetail(
  bookingId: string
): Promise<BookingDetailResponse> {
  const res = await http.get(`/booking/${bookingId}`);
  return (res as { data: BookingDetailResponse }).data;
}
