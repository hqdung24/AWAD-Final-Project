import { http } from '@/lib/http';
import { isAxiosError } from 'axios';

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
  try {
    const res = await http.get('/dashboard/admin');
    // backend wraps payload in { data: ... }
    return (res as { data: AdminDashboard }).data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      const err = new Error('FORBIDDEN');
      (err as any).status = 403;
      throw err;
    }
    throw error;
  }
}

export async function fetchUserDashboard(): Promise<UserDashboard> {
  try {
    const res = await http.get('/dashboard/user');
    return (res as { data: UserDashboard }).data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      const err = new Error('FORBIDDEN');
      (err as any).status = 403;
      throw err;
    }
    throw error;
  }
}
