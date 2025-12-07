import { http } from '@/lib/http';
import type {
  CreateBookingRequest,
  CreateBookingResponse,
} from '@/schemas/booking';

export async function createBooking(
  payload: CreateBookingRequest
): Promise<CreateBookingResponse> {
  const res = await http.post('/booking', payload);
  return (res as { data: CreateBookingResponse }).data;
}
