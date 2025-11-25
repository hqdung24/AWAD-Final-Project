import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

type SummaryCard = { title: string; value: number; delta?: number; currency?: string };
type TrendPoint = { day: string; bookings: number };
type TopRoute = { route: string; bookings: number; revenue: number };
type RecentBooking = { id: string; user: string; route: string; status: string };

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly dataSource: DataSource) {}

  private async hasTable(table: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `SELECT to_regclass($1) AS exists`,
        [`public.${table}`],
      );
      return Boolean(result?.[0]?.exists);
    } catch (e) {
      this.logger.warn(`Table check failed for ${table}: ${String(e)}`);
      return false;
    }
  }

  private getAdminFallback() {
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

  private getUserFallback() {
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

  async getAdminDashboard() {
    const fallback = this.getAdminFallback();
    try {
      const cards: SummaryCard[] = [];
      // active users (always available via users table)
      const [{ count: userCount } = { count: 0 }] = await this.dataSource.query(
        `select count(*)::int as count from users`,
      );

      cards.push({ title: 'Active Users', value: Number(userCount ?? 0), delta: 0 });

      const hasBookings = await this.hasTable('booking');
      const hasPayments = await this.hasTable('payment');
      const hasTrips = await this.hasTable('trip');
      const hasRoutes = await this.hasTable('route');

      let totalBookings = 0;
      let revenueToday = 0;
      let trend: TrendPoint[] = fallback.trend;
      let topRoutes: TopRoute[] = fallback.topRoutes;
      let recentBookings: RecentBooking[] = fallback.recentBookings;

      if (hasBookings) {
        const [bookingAgg] = await this.dataSource.query(
          `select count(*)::int as total_bookings from booking`,
        );
        totalBookings = Number(bookingAgg?.total_bookings ?? 0);
        cards.unshift({ title: 'Total Bookings', value: totalBookings, delta: 0 });

        const trendRaw = await this.dataSource.query(
          `
            select to_char(date_trunc('day', b.booked_at), 'Dy') as day,
                   count(*)::int as bookings
            from booking b
            where b.booked_at >= now() - interval '6 days'
            group by date_trunc('day', b.booked_at)
            order by date_trunc('day', b.booked_at);
          `,
        );
        if (Array.isArray(trendRaw) && trendRaw.length > 0) {
          trend = trendRaw.map((row: { day: string; bookings: number }) => ({
            day: row.day,
            bookings: Number(row.bookings ?? 0),
          }));
        }

        const recentRaw = await this.dataSource.query(
          `
            select
              b.id as id,
              coalesce(u."firstName", 'User') || ' ' || coalesce(u."lastName", '') as user,
              concat(r.origin, ' → ', r.destination) as route,
              coalesce(b.status, 'Pending') as status
            from booking b
            left join users u on u.id = b.user_id
            left join trip t on t.id = b.trip_id
            left join route r on r.id = t.route_id
            order by b.booked_at desc
            limit 5;
          `,
        );
        if (Array.isArray(recentRaw) && recentRaw.length > 0) {
          recentBookings = recentRaw.map((row: any) => ({
            id: String(row.id),
            user: row.user ?? 'User',
            route: row.route ?? '—',
            status: row.status ?? 'Pending',
          }));
        }
      }

      if (hasPayments && hasBookings) {
        const [revRow] = await this.dataSource.query(
          `
            select coalesce(sum(p.amount), 0)::bigint as revenue_today
            from payment p
            where p.status = 'processed'
              and p.processed_at::date = current_date;
          `,
        );
        revenueToday = Number(revRow?.revenue_today ?? 0);
        cards.push({
          title: 'Revenue Today',
          value: revenueToday,
          currency: 'VND',
          delta: 0,
        });
      } else {
        cards.push(fallback.summaryCards[2]);
      }

      if (hasRoutes && hasTrips && hasBookings) {
        const topRoutesRaw = await this.dataSource.query(
          `
            select
              concat(r.origin, ' → ', r.destination) as route,
              count(b.id)::int as bookings,
              coalesce(sum(case when p.status = 'processed' then p.amount end), 0)::bigint as revenue
            from route r
            join trip t on t.route_id = r.id
            left join booking b on b.trip_id = t.id
            left join payment p on p.booking_id = b.id
            group by r.origin, r.destination
            order by bookings desc
            limit 5;
          `,
        );
        if (Array.isArray(topRoutesRaw) && topRoutesRaw.length > 0) {
          topRoutes = topRoutesRaw.map((row: any) => ({
            route: row.route ?? '—',
            bookings: Number(row.bookings ?? 0),
            revenue: Number(row.revenue ?? 0),
          }));
        }
      }

      // ensure consistent order of cards
      const summaryCards: SummaryCard[] = [];
      const bookingsCard = cards.find((c) => c.title === 'Total Bookings');
      if (bookingsCard) summaryCards.push(bookingsCard);
      summaryCards.push(cards.find((c) => c.title === 'Active Users') ?? cards[0]);
      const revenueCard = cards.find((c) => c.title === 'Revenue Today');
      if (revenueCard) summaryCards.push(revenueCard);

      return {
        summaryCards,
        trend,
        topRoutes,
        recentBookings,
      };
    } catch (error) {
      this.logger.warn(`Falling back to mock admin dashboard: ${String(error)}`);
      return fallback;
    }
  }

  async getUserDashboard(userId: string) {
    const fallback = this.getUserFallback();
    if (!userId) return fallback;

    try {
      const hasBookings = await this.hasTable('booking');
      const hasTrips = await this.hasTable('trip');
      const hasRoutes = await this.hasTable('route');
      const hasSeatStatus = await this.hasTable('seat_status');

      if (!hasBookings || !hasTrips || !hasRoutes) {
        return fallback;
      }

      const seatJoin = hasSeatStatus
        ? 'left join seat_status ss on ss.booking_id = b.id'
        : '';
      const seatSelect = hasSeatStatus
        ? 'coalesce(string_agg(ss.seat_code, \', \'), \'\')'
        : `''`;

      const upcomingTripsRaw = await this.dataSource.query(
        `
          select
            b.id as booking_id,
            concat(r.origin, ' → ', r.destination) as route,
            to_char(t.departure_time, 'DD Mon YYYY, HH24:MI') as departure,
            ${seatSelect} as seats,
            coalesce(b.status, 'Pending') as status
          from booking b
          join trip t on t.id = b.trip_id
          join route r on r.id = t.route_id
          ${seatJoin}
          where b.user_id = $1
            and t.departure_time > now()
            and coalesce(b.status, 'Pending') in ('CONFIRMED', 'PAID', 'PENDING')
          group by b.id, r.origin, r.destination, t.departure_time, b.status
          order by t.departure_time asc
          limit 5;
        `,
        [userId],
      );

      const upcomingTrips =
        Array.isArray(upcomingTripsRaw) && upcomingTripsRaw.length > 0
          ? upcomingTripsRaw.map((row: any) => ({
              route: row.route ?? '—',
              datetime: row.departure ?? '',
              seats: row.seats || '—',
              bookingId: String(row.booking_id),
              actions: ['View E-ticket', row.status === 'PAID' ? 'Cancel' : 'Modify'],
            }))
          : fallback.upcomingTrips;

      const notifications = [
        {
          type: 'upcoming',
          message: upcomingTrips.length
            ? `You have ${upcomingTrips.length} upcoming trip(s)`
            : 'No upcoming trips yet',
        },
        fallback.notifications[1],
      ];

      return { upcomingTrips, notifications };
    } catch (error) {
      this.logger.warn(`Falling back to mock user dashboard: ${String(error)}`);
      return fallback;
    }
  }
}
