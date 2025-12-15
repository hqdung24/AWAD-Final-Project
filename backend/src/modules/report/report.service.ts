import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

type ReportFilters = {
  from?: string;
  to?: string;
  operatorId?: string;
  routeId?: string;
};

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(private readonly dataSource: DataSource) {}

  private getFilterWhere(filters: ReportFilters) {
    const clauses: string[] = [];
    const params: Record<string, unknown> = {};

    if (filters.from) {
      clauses.push(
        '(coalesce(p.paid_at, p.updated_at, p.created_at, b.booked_at)::date >= :from)',
      );
      params.from = filters.from;
    }
    if (filters.to) {
      clauses.push(
        '(coalesce(p.paid_at, p.updated_at, p.created_at, b.booked_at)::date <= :to)',
      );
      params.to = filters.to;
    }
    if (filters.operatorId) {
      clauses.push('r.operator_id = :operatorId');
      params.operatorId = filters.operatorId;
    }
    if (filters.routeId) {
      clauses.push('r.id = :routeId');
      params.routeId = filters.routeId;
    }

    const where = clauses.length ? `where ${clauses.join(' and ')}` : '';
    return { where, params };
  }

  async getAdminReport(filters: ReportFilters) {
    const fallback = {
      revenueSeries: [],
      bookingStatus: [],
      cancellations: [],
      refunds: 0,
      topRoutes: [],
      topOperators: [],
      totals: {
        revenue: 0,
        bookings: 0,
        cancelled: 0,
        refunded: 0,
      },
    };

    try {
      const params = [
        filters.from ?? null,
        filters.to ?? null,
        filters.operatorId ?? null,
        filters.routeId ?? null,
      ];
      const dateExpr =
        'coalesce(p.paid_at, p.updated_at, p.created_at, b.booked_at)::date';
      const baseWhere = `
        where (${dateExpr} >= coalesce($1::date, current_date - interval '29 days'))
          and (${dateExpr} <= coalesce($2::date, current_date))
          and ($3::uuid is null or r.operator_id = $3)
          and ($4::uuid is null or r.id = $4)
      `;
      const baseWhereWithoutDate = `
        where ($3::uuid is null or r.operator_id = $3)
          and ($4::uuid is null or r.id = $4)
      `;

      const revenueSeries = await this.dataSource.query(
        `
          with days as (
            select generate_series(
              coalesce($1::date, current_date - interval '29 days'),
              coalesce($2::date, current_date),
              interval '1 day'
            )::date as day
          )
          select
            to_char(d.day, 'YYYY-MM-DD') as date,
            coalesce(sum(case when lower(p.status::text) = 'paid' then p.amount end), 0)::numeric as revenue
          from days d
          left join payments p
            on coalesce(p.paid_at, p.updated_at, p.created_at)::date = d.day
          left join bookings b on b.id = p.booking_id
          left join trips t on t.id = b.trip_id
          left join routes r on r.id = t.route_id
          ${baseWhereWithoutDate}
          group by d.day
          order by d.day;
        `,
        params,
      );

      const bookingStatus = await this.dataSource.query(
        `
          select upper(coalesce(b.status, 'PENDING')) as status, count(*)::int as count
          from bookings b
          left join payments p on p.booking_id = b.id
          left join trips t on t.id = b.trip_id
          left join routes r on r.id = t.route_id
          ${baseWhere}
          group by upper(coalesce(b.status, 'PENDING'));
        `,
        params,
      );

      const cancellations = await this.dataSource.query(
        `
          select to_char(b.booked_at::date, 'YYYY-MM-DD') as date, count(*)::int as cancelled
          from bookings b
          left join payments p on p.booking_id = b.id
          left join trips t on t.id = b.trip_id
          left join routes r on r.id = t.route_id
          ${baseWhere} and lower(b.status::text) = 'cancelled'
          group by b.booked_at::date
          order by b.booked_at::date;
        `,
        params,
      );

      const refundsRow = await this.dataSource.query(
        `
          select coalesce(sum(p.amount), 0)::numeric as refunded
          from payments p
          left join bookings b on b.id = p.booking_id
          left join trips t on t.id = b.trip_id
          left join routes r on r.id = t.route_id
          ${baseWhere} and lower(p.status::text) = 'refunded'
        `,
        params,
      );

      const topRoutes = await this.dataSource.query(
        `
          select
            concat(r.origin, ' → ', r.destination) as route,
            count(distinct b.id)::int as bookings,
            coalesce(sum(case when lower(p.status::text) = 'paid' then p.amount end), 0)::numeric as revenue
          from routes r
          join trips t on t.route_id = r.id
          left join bookings b on b.trip_id = t.id
          left join payments p on p.booking_id = b.id
          ${baseWhere}
          group by r.origin, r.destination
          order by revenue desc
          limit 10;
        `,
        params,
      );

      const topOperators = await this.dataSource.query(
        `
          select
            o.name as operator,
            count(distinct b.id)::int as bookings,
            coalesce(sum(case when lower(p.status::text) = 'paid' then p.amount end), 0)::numeric as revenue
          from operators o
          join routes r on r.operator_id = o.id
          join trips t on t.route_id = r.id
          left join bookings b on b.trip_id = t.id
          left join payments p on p.booking_id = b.id
          ${baseWhere}
          group by o.name
          order by revenue desc
          limit 10;
        `,
        params,
      );

      const totalsRow = await this.dataSource.query(
        `
          select
            coalesce(sum(case when lower(p.status::text) = 'paid' then p.amount end), 0)::numeric as revenue,
            count(distinct b.id)::int as bookings,
            sum(case when lower(b.status::text) = 'cancelled' then 1 else 0 end)::int as cancelled,
            coalesce(sum(case when lower(p.status::text) = 'refunded' then p.amount end), 0)::numeric as refunded
          from bookings b
          left join payments p on p.booking_id = b.id
          left join trips t on t.id = b.trip_id
          left join routes r on r.id = t.route_id
          ${baseWhere}
        `,
        params,
      );

      return {
        revenueSeries,
        bookingStatus,
        cancellations,
        refunds: Number(refundsRow?.[0]?.refunded ?? 0),
        topRoutes,
        topOperators,
        totals: {
          revenue: Number(totalsRow?.[0]?.revenue ?? 0),
          bookings: Number(totalsRow?.[0]?.bookings ?? 0),
          cancelled: Number(totalsRow?.[0]?.cancelled ?? 0),
          refunded: Number(totalsRow?.[0]?.refunded ?? 0),
        },
      };
    } catch (error) {
      this.logger.warn(`Report fallback due to error: ${String(error)}`);
      return fallback;
    }
  }

  async exportAdminReport(filters: ReportFilters): Promise<string> {
    const report = await this.getAdminReport(filters);
    const lines = [
      ['Date', 'Revenue', 'Bookings', 'Cancelled', 'Refunded'],
      ...report.revenueSeries.map((row: any) => [
        row.date,
        row.revenue,
        '',
        '',
        '',
      ]),
    ];

    const csv = lines.map((l) => l.join(',')).join('\n');
    return csv;
  }
}
