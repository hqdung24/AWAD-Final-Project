import { http } from '@/lib/http';

export type AdminDashboard = {
  summaryCards: Array<{ title: string; value: number; delta?: number; currency?: string }>;
  trend: Array<{ day: string; bookings: number }>;
  topRoutes: Array<{ route: string; bookings: number; revenue: number }>;
  recentBookings: Array<{ id: string; user: string; route: string; status: string }>;
};

export type UserDashboard = {
  upcomingTrips: Array<{
    route: string;
    datetime: string;
    seats: string;
    bookingId: string;
    actions: string[];
  }>;
  notifications: Array<{ type: string; message: string }>;
};

export async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const res = await http.get('/dashboard/admin');
  // backend wraps payload in { data: ... }
  return (res as { data: AdminDashboard }).data;
}

export async function fetchUserDashboard(): Promise<UserDashboard> {
  const res = await http.get('/dashboard/user');
  return (res as { data: UserDashboard }).data;
}
