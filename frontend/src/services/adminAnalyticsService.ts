import { http } from '@/lib/http';

export type RevenueAnalytics = {
  totalRevenue: number;
  revenueSeries: Array<{ date: string; revenue: number }>;
  paymentStatus: Array<{ status: string; count: number; amount: number }>;
  topRoutesByRevenue: Array<{ route: string; revenue: number; bookings: number }>;
};

export type BookingAnalytics = {
  bookingTrend: Array<{ date: string; bookings: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  topRoutesByBookings: Array<{ route: string; bookings: number }>;
  cancellationRate: number;
};

export async function fetchRevenueAnalytics(): Promise<RevenueAnalytics> {
  const res = await http.get('/dashboard/admin/analytics/revenue');
  return (res as { data: RevenueAnalytics }).data;
}

export async function fetchBookingAnalytics(): Promise<BookingAnalytics> {
  const res = await http.get('/dashboard/admin/analytics/bookings');
  return (res as { data: BookingAnalytics }).data;
}
