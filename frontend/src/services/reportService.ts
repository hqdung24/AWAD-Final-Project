import { http } from '@/lib/http';

export type ReportFilters = {
  from?: string;
  to?: string;
  operatorId?: string;
  routeId?: string;
  groupBy?: 'day' | 'week' | 'month';
};

export type AdminReport = {
  revenueSeries: Array<{ date: string; revenue: number }>;
  bookingStatus: Array<{ status: string; count: number }>;
  cancellations: Array<{ date: string; cancelled: number }>;
  refunds: number;
  topRoutes: Array<{ route: string; bookings: number; revenue: number }>;
  topOperators: Array<{ operator: string; bookings: number; revenue: number }>;
  totals: {
    revenue: number;
    bookings: number;
    cancelled: number;
    refunded: number;
  };
};

export async function fetchAdminReport(filters: ReportFilters): Promise<AdminReport> {
  const res = await http.get('/reports/admin', { params: filters });
  return (res as { data: AdminReport }).data;
}

export async function exportAdminReport(filters: ReportFilters): Promise<Blob> {
  const res = await http.get('/reports/admin/export', {
    params: filters,
    responseType: 'blob',
  });
  return res as Blob;
}
