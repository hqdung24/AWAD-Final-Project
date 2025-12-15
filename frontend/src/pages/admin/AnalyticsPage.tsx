import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import {
  fetchRevenueAnalytics,
  fetchBookingAnalytics,
  type RevenueAnalytics,
  type BookingAnalytics,
} from '@/services/adminAnalyticsService';
import { ArrowUpRight, ChartPie, TrendingUp } from 'lucide-react';

const palette = ['#2563eb', '#22c55e', '#eab308', '#f97316', '#ef4444'];

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const {
    data: revenueData,
    isLoading: revenueLoading,
    error: revenueError,
  } = useQuery<RevenueAnalytics>({
    queryKey: ['admin-analytics-revenue'],
    queryFn: fetchRevenueAnalytics,
    retry: false,
  });

  const {
    data: bookingData,
    isLoading: bookingLoading,
    error: bookingError,
  } = useQuery<BookingAnalytics>({
    queryKey: ['admin-analytics-bookings'],
    queryFn: fetchBookingAnalytics,
    retry: false,
  });

  if (revenueError || bookingError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isForbidden = (revenueError as any)?.status === 403 || (bookingError as any)?.status === 403;
    if (isForbidden) {
      navigate('/403');
    }
  }

  const totalPayments = useMemo(() => {
    return (
      revenueData?.paymentStatus?.reduce(
        (acc, cur) => ({
          count: acc.count + (cur.count ?? 0),
          amount: acc.amount + (cur.amount ?? 0),
        }),
        { count: 0, amount: 0 },
      ) ?? { count: 0, amount: 0 }
    );
  }, [revenueData]);

  const averageTicket =
    revenueData && totalPayments.count > 0
      ? revenueData.totalRevenue / totalPayments.count
      : 0;

  const paidRate =
    totalPayments.count > 0
      ? (revenueData?.paymentStatus?.find((p) => p.status === 'PAID')?.count ?? 0) /
        totalPayments.count
      : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Admin Analytics</p>
          <h1 className="text-3xl font-bold tracking-tight">Revenue & Bookings</h1>
          <p className="text-muted-foreground text-sm">
            Monitor revenue performance and booking trends with real-time data.
          </p>
          {(revenueLoading || bookingLoading) && (
            <p className="text-xs text-muted-foreground mt-1">Loading analytics…</p>
          )}
        </div>
        <Badge variant="outline" className="gap-2">
          <ChartPie className="h-4 w-4" />
          Updated live
        </Badge>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {revenueData
              ? `${(revenueData.totalRevenue / 1_000_000).toFixed(1)}M VND`
              : '—'}
            <div className="text-sm text-muted-foreground mt-2">
              Across all paid transactions
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Average Ticket</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {averageTicket ? `${Math.round(averageTicket).toLocaleString()} VND` : '—'}
            <div className="text-sm text-muted-foreground mt-2">
              Revenue per completed booking
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Paid Conversion</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold flex items-center gap-2">
            {(paidRate * 100).toFixed(0)}%
            <ArrowUpRight className="h-5 w-5 text-emerald-600" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue (Last 30 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer
              config={{
                revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
              }}
              className="h-full"
            >
              <LineChart data={revenueData?.revenueSeries ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col">
            <ChartContainer
              config={
                Object.fromEntries(
                  (revenueData?.paymentStatus ?? []).map((item, idx) => [
                    item.status?.toLowerCase() || `status-${idx}`,
                    { label: item.status ?? 'Status', color: palette[idx % palette.length] },
                  ]),
                ) || { payments: { label: 'Payments', color: palette[0] } }
              }
              className="flex-1"
            >
              <PieChart>
                <Pie
                  data={revenueData?.paymentStatus ?? []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {(revenueData?.paymentStatus ?? []).map((_, idx) => (
                    <Cell key={idx} fill={palette[idx % palette.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label) => `Status: ${String(label)}`}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {(revenueData?.paymentStatus ?? []).map((item, idx) => (
                <div className="flex items-center justify-between text-sm" key={item.status}>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: palette[idx % palette.length] }}
                    />
                    <span className="font-medium">{item.status}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {item.count} • {(item.amount / 1_000_000).toFixed(1)}M
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Booking Trend (Last 14 days)</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              Demand
            </Badge>
          </CardHeader>
          <CardContent className="h-72">
            <ChartContainer
              config={{
                bookings: { label: 'Bookings', color: 'hsl(var(--primary))' },
              }}
              className="h-full"
            >
              <BarChart data={bookingData?.bookingTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(bookingData?.statusBreakdown ?? []).map((item, idx) => (
              <div className="flex items-center justify-between text-sm" key={item.status}>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: palette[idx % palette.length] }}
                  />
                  <span className="font-medium">{item.status}</span>
                </div>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
            ))}
            <div className="text-xs text-muted-foreground pt-2">
              Cancellation rate:{' '}
              {(((bookingData?.cancellationRate ?? 0) * 100).toFixed(1))}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Bookings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(revenueData?.topRoutesByRevenue ?? []).map((route) => (
                <TableRow key={route.route}>
                  <TableCell className="font-medium">{route.route}</TableCell>
                  <TableCell>
                    {(route.revenue / 1_000_000).toFixed(1)}M
                  </TableCell>
                  <TableCell>{route.bookings}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
