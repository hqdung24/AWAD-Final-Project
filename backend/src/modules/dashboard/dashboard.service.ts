import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getAdminDashboard() {
    return {
      summaryCards: [
        { title: 'Total Bookings', value: 1234, delta: 0.12 },
        { title: 'Active Users', value: 856, delta: 0.05 },
        { title: 'Revenue Today', value: 45200000, currency: 'VND', delta: 0.08 },
      ],
      trend: [
        { day: 'Mon', bookings: 120 },
        { day: 'Tue', bookings: 150 },
        { day: 'Wed', bookings: 170 },
        { day: 'Thu', bookings: 140 },
        { day: 'Fri', bookings: 210 },
        { day: 'Sat', bookings: 180 },
        { day: 'Sun', bookings: 200 },
      ],
      topRoutes: [
        { route: 'HCM → Hanoi', bookings: 234, revenue: 8200000 },
        { route: 'HCM → Dalat', bookings: 189, revenue: 3400000 },
        { route: 'HCM → Can Tho', bookings: 142, revenue: 2800000 },
      ],
      recentBookings: [
        { id: 'BK20251115001', user: 'Tran Anh', route: 'HCM → Hanoi', status: 'Paid' },
        { id: 'BK20251115002', user: 'Le Minh', route: 'HCM → Dalat', status: 'Pending' },
        { id: 'BK20251115003', user: 'Nguyen Ha', route: 'Hanoi → Hue', status: 'Cancelled' },
      ],
    };
  }

  getUserDashboard() {
    return {
      upcomingTrips: [
        {
          route: 'HCM → Hanoi',
          datetime: '15 Nov 2025, 08:00',
          seats: 'A1, A2',
          bookingId: 'BK20251115001',
          actions: ['View E-ticket', 'Cancel'],
        },
        {
          route: 'Hanoi → Hue',
          datetime: '20 Nov 2025, 14:00',
          seats: 'B3',
          bookingId: 'BK20251115010',
          actions: ['View E-ticket', 'Modify'],
        },
      ],
      notifications: [
        { type: 'upcoming', message: 'You have 2 unread notifications' },
        { type: 'alert', message: 'Get alerts for departure changes' },
      ],
    };
  }
}
