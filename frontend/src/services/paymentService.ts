import { http } from '@/lib/http';
import type { CreatePaymentLinkResponse } from '@/schemas/payment';

export async function createPayment(
  bookingId: string
): Promise<CreatePaymentLinkResponse> {
  const res = await http.post('/payment', { bookingId });
  return (res as { data: CreatePaymentLinkResponse }).data;
}
