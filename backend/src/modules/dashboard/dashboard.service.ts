import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

type SummaryCard = {
  title: string;
  value: number;
  delta?: number;
  currency?: string;
};
type TrendPoint = { day: string; bookings: number };
type TopRoute = { route: string; bookings: number; revenue: number };
type RecentBooking = {
  id: string;
  user: string;
  route: string;
  status: string;
};
type RevenueAnalytics = {
  totalRevenue: number;
  revenueSeries: Array<{ date: string; revenue: number }>;
  paymentStatus: Array<{ status: string; count: number; amount: number }>;
  topRoutesByRevenue: Array<{ route: string; revenue: number; bookings: number }>;
};
type BookingAnalytics = {
  bookingTrend: Array<{ date: string; bookings: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  topRoutesByBookings: Array<{ route: string; bookings: number }>;
  cancellationRate: number;
};

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly dataSource: DataSource) {}

  private async hasTable(table: string): Promise<boolean> {
    try {
      const namesToCheck = [table];
      if (table.endsWith('s')) {
        namesToCheck.push(table.slice(0, -1));
      }
      for (const name of namesToCheck) {
        const result = await this.dataSource.query(
          `SELECT to_regclass($1) AS exists`,
          [`public.${name}`],
        );
        if (Boolean(result?.[0]?.exists)) return true;
      }
      return false;
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
        {
          title: 'Revenue Today',
          value: 45200000,
          currency: 'VND',
          delta: 0.08,
        },
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
        {
          id: 'BK20251115001',
          user: 'Tran Anh',
          route: 'HCM → Hanoi',
          status: 'Paid',
        },
        {
          id: 'BK20251115002',
          user: 'Le Minh',
          route: 'HCM → Dalat',
          status: 'Pending',
        },
        {
          id: 'BK20251115003',
          user: 'Nguyen Ha',
          route: 'Hanoi → Hue',
          status: 'Cancelled',
        },
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

      cards.push({
        title: 'Active Users',
        value: Number(userCount ?? 0),
        delta: 0,
      });

      const hasBookings = await this.hasTable('bookings');
      const hasPayments = await this.hasTable('payments');
      const hasTrips = await this.hasTable('trips');
      const hasRoutes = await this.hasTable('routes');

      let totalBookings = 0;
      let revenueToday = 0;
      let trend: TrendPoint[] = fallback.trend;
      let topRoutes: TopRoute[] = fallback.topRoutes;
      let recentBookings: RecentBooking[] = fallback.recentBookings;

      if (hasBookings) {
        const [bookingAgg] = await this.dataSource.query(
          `select count(*)::int as total_bookings from bookings`,
        );
        totalBookings = Number(bookingAgg?.total_bookings ?? 0);
        cards.unshift({
          title: 'Total Bookings',
          value: totalBookings,
          delta: 0,
        });

        const trendRaw = await this.dataSource.query(
          `
            select to_char(date_trunc('day', b.booked_at), 'Dy') as day,
                   count(*)::int as bookings
            from bookings b
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
              coalesce(u.first_name, 'User') || ' ' || coalesce(u.last_name, '') as user,
              concat(r.origin, ' → ', r.destination) as route,
              coalesce(b.status, 'Pending') as status
            from bookings b
            left join users u on u.id = b.user_id
            left join trips t on t.id = b.trip_id
            left join routes r on r.id = t.route_id
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
            from payments p
            where lower(p.status::text) in ('paid', 'processed')
              and coalesce(p.paid_at, p.updated_at, p.created_at)::date = current_date;
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
              coalesce(sum(case when lower(p.status::text) in ('paid', 'processed') then p.amount end), 0)::bigint as revenue
            from routes r
            join trips t on t.route_id = r.id
            left join bookings b on b.trip_id = t.id
            left join payments p on p.booking_id = b.id
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
      summaryCards.push(
        cards.find((c) => c.title === 'Active Users') ?? cards[0],
      );
      const revenueCard = cards.find((c) => c.title === 'Revenue Today');
      if (revenueCard) summaryCards.push(revenueCard);

      return {
        summaryCards,
        trend,
        topRoutes,
        recentBookings,
      };
    } catch (error) {
      this.logger.warn(
        `Falling back to mock admin dashboard: ${String(error)}`,
      );
      return fallback;
    }
  }

  async getAdminRevenueAnalytics(): Promise<RevenueAnalytics> {
    const hasPayments = await this.hasTable('payments');
    const hasBookings = await this.hasTable('bookings');
    const hasTrips = await this.hasTable('trips');
    const hasRoutes = await this.hasTable('routes');

    if (!hasPayments || !hasBookings) {
      return {
        totalRevenue: 0,
        revenueSeries: [],
        paymentStatus: [],
        topRoutesByRevenue: [],
      };
    }

    const [totalRevenueRow] = await this.dataSource.query(
      `
        select coalesce(sum(p.amount), 0)::bigint as total_revenue
        from payments p
        where lower(p.status::text) in ('paid', 'processed');
      `,
    );

    const revenueSeriesRaw = await this.dataSource.query(
      `
        select
          to_char(coalesce(p.paid_at, p.updated_at, p.created_at)::date, 'YYYY-MM-DD') as date,
          coalesce(sum(p.amount), 0)::bigint as revenue
        from payments p
        where lower(p.status::text) in ('paid', 'processed')
          and coalesce(p.paid_at, p.updated_at, p.created_at) >= now() - interval '29 days'
        group by coalesce(p.paid_at, p.updated_at, p.created_at)::date
        order by coalesce(p.paid_at, p.updated_at, p.created_at)::date;
      `,
    );

    const paymentStatusRaw = await this.dataSource.query(
      `
        select
          p.status::text as status,
          count(*)::int as count,
          coalesce(sum(p.amount), 0)::bigint as amount
        from payments p
        group by p.status;
      `,
    );

    let topRoutesByRevenue: RevenueAnalytics['topRoutesByRevenue'] = [];
    if (hasTrips && hasRoutes) {
      const topRoutesRaw = await this.dataSource.query(
        `
          select
            concat(r.origin, ' → ', r.destination) as route,
            coalesce(sum(case when lower(p.status::text) in ('paid', 'processed') then p.amount end), 0)::bigint as revenue,
            count(distinct b.id)::int as bookings
          from routes r
          join trips t on t.route_id = r.id
          join bookings b on b.trip_id = t.id
          left join payments p on p.booking_id = b.id
          group by r.origin, r.destination
          order by revenue desc
          limit 5;
        `,
      );

      if (Array.isArray(topRoutesRaw) && topRoutesRaw.length > 0) {
        topRoutesByRevenue = topRoutesRaw.map((row: any) => ({
          route: row.route ?? '—',
          revenue: Number(row.revenue ?? 0),
          bookings: Number(row.bookings ?? 0),
        }));
      }
    }

    const revenueSeries =
      Array.isArray(revenueSeriesRaw) && revenueSeriesRaw.length
        ? revenueSeriesRaw.map((row: any) => ({
            date: row.date,
            revenue: Number(row.revenue ?? 0),
          }))
        : [];

    const paymentStatus =
      Array.isArray(paymentStatusRaw) && paymentStatusRaw.length
        ? paymentStatusRaw.map((row: any) => ({
            status: row.status ?? 'UNKNOWN',
            count: Number(row.count ?? 0),
            amount: Number(row.amount ?? 0),
          }))
        : [];

    return {
      totalRevenue: Number(totalRevenueRow?.total_revenue ?? 0),
      revenueSeries,
      paymentStatus,
      topRoutesByRevenue,
    };
  }

  async getAdminBookingAnalytics(): Promise<BookingAnalytics> {
    const fallback: BookingAnalytics = {
      bookingTrend: [
        { date: 'Mon', bookings: 120 },
        { date: 'Tue', bookings: 150 },
        { date: 'Wed', bookings: 170 },
        { date: 'Thu', bookings: 140 },
        { date: 'Fri', bookings: 210 },
        { date: 'Sat', bookings: 180 },
        { date: 'Sun', bookings: 200 },
      ],
      statusBreakdown: [
        { status: 'PAID', count: 120 },
        { status: 'PENDING', count: 18 },
        { status: 'CANCELLED', count: 12 },
        { status: 'EXPIRED', count: 5 },
      ],
      topRoutesByBookings: [
        { route: 'HCM → Hanoi', bookings: 234 },
        { route: 'HCM → Dalat', bookings: 189 },
        { route: 'HCM → Can Tho', bookings: 142 },
      ],
      cancellationRate: 0.08,
    };

    try {
      const hasBookings = await this.hasTable('bookings');
      const hasTrips = await this.hasTable('trips');
      const hasRoutes = await this.hasTable('routes');

      if (!hasBookings) {
        return fallback;
      }

      const bookingTrendRaw = await this.dataSource.query(
        `
          select
            to_char(b.booked_at::date, 'YYYY-MM-DD') as date,
            count(*)::int as bookings
          from bookings b
          where b.booked_at >= now() - interval '13 days'
          group by b.booked_at::date
          order by b.booked_at::date;
        `,
      );

      const statusBreakdownRaw = await this.dataSource.query(
        `
          select
            upper(coalesce(b.status, 'PENDING')) as status,
            count(*)::int as count
          from bookings b
          group by upper(coalesce(b.status, 'PENDING'));
        `,
      );

      let topRoutesByBookings = fallback.topRoutesByBookings;
      if (hasTrips && hasRoutes) {
        const topRoutesRaw = await this.dataSource.query(
          `
            select
              concat(r.origin, ' → ', r.destination) as route,
              count(b.id)::int as bookings
            from routes r
            join trips t on t.route_id = r.id
            left join bookings b on b.trip_id = t.id
            group by r.origin, r.destination
            order by bookings desc
            limit 5;
          `,
        );

        if (Array.isArray(topRoutesRaw) && topRoutesRaw.length > 0) {
          topRoutesByBookings = topRoutesRaw.map((row: any) => ({
            route: row.route ?? '—',
            bookings: Number(row.bookings ?? 0),
          }));
        }
      }

      const [cancelAgg] = await this.dataSource.query(
        `
          select
            sum(case when lower(b.status) = 'cancelled' then 1 else 0 end)::int as cancelled,
            count(*)::int as total
          from bookings b;
        `,
      );

      const bookingTrend =
        Array.isArray(bookingTrendRaw) && bookingTrendRaw.length
          ? bookingTrendRaw.map((row: any) => ({
              date: row.date,
              bookings: Number(row.bookings ?? 0),
            }))
          : fallback.bookingTrend;

      const statusBreakdown =
        Array.isArray(statusBreakdownRaw) && statusBreakdownRaw.length
          ? statusBreakdownRaw.map((row: any) => ({
              status: row.status ?? 'UNKNOWN',
              count: Number(row.count ?? 0),
            }))
          : fallback.statusBreakdown;

      const total = Number(cancelAgg?.total ?? 0) || 0;
      const cancelled = Number(cancelAgg?.cancelled ?? 0) || 0;
      const cancellationRate = total > 0 ? cancelled / total : 0;

      return {
        bookingTrend,
        statusBreakdown,
        topRoutesByBookings,
        cancellationRate,
      };
    } catch (error) {
      this.logger.warn(
        `Falling back to mock booking analytics: ${String(error)}`,
      );
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
        ? "coalesce(string_agg(ss.seat_code, ', '), '')"
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
              actions: [
                'View E-ticket',
                row.status === 'PAID' ? 'Cancel' : 'Modify',
              ],
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
