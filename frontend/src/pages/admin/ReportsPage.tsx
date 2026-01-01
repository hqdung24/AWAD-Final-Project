import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { downloadBlob } from '@/lib/downloadBlob';
import {
  fetchAdminReport,
  exportAdminReport,
  type AdminReport,
} from '@/services/reportService';
import { listAdminRoutes, type AdminRoute } from '@/services/adminRoutesService';
import { listOperators, type Operator } from '@/services/operatorService';
import { Download, Filter, PieChart, TrendingUp, RotateCcw } from 'lucide-react';

type RangeOption = '7d' | '30d' | '90d';

const palette = ['#2563eb', '#22c55e', '#eab308', '#f97316', '#ef4444'];

const ReportsPage = () => {
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeOption>('30d');
  const [operatorId, setOperatorId] = useState('__all__');
  const [routeId, setRouteId] = useState('__all__');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filters = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const today = new Date();
    const baseFrom = new Date();
    baseFrom.setDate(today.getDate() - (days - 1));
    return {
      from: (dateFrom || baseFrom.toISOString().slice(0, 10)) ?? '',
      to: (dateTo || today.toISOString().slice(0, 10)) ?? '',
      operatorId: operatorId && operatorId !== '__all__' ? operatorId : undefined,
      routeId: routeId && routeId !== '__all__' ? routeId : undefined,
    };
  }, [range, operatorId, routeId, dateFrom, dateTo]);

  const { data: operators = [] } = useQuery<Operator[]>({
    queryKey: ['operators'],
    queryFn: listOperators,
  });

  const { data: routes = [] } = useQuery<AdminRoute[]>({
    queryKey: ['admin-routes'],
    queryFn: () => listAdminRoutes({ isActive: true }),
  });

  const { data, isLoading, error, refetch } = useQuery<AdminReport>({
    queryKey: ['admin-report', filters],
    queryFn: () => fetchAdminReport(filters),
    retry: false,
  });

  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isForbidden = (error as any)?.status === 403;
    if (isForbidden) navigate('/403');
  }

  const bookingStatusSeries =
    data?.bookingStatus.map((item, idx) => ({
      status: item.status,
      count: item.count,
      color: palette[idx % palette.length],
    })) ?? [];

  const handleExport = async () => {
    const blob = await exportAdminReport(filters);
    downloadBlob(blob, `report-${filters.from}-${filters.to}.csv`);
  };

  const summary = data?.totals ?? {
    revenue: 0,
    bookings: 0,
    cancelled: 0,
    refunded: 0,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">Admin Reports</p>
          <h1 className="text-3xl font-bold tracking-tight">Revenue & Booking Reports</h1>
          <p className="text-muted-foreground text-sm">
            Analyze revenue, bookings, cancellations, and operator performance.
          </p>
          {isLoading && (
            <p className="text-xs text-muted-foreground">Loading reports…</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={range} onValueChange={(val: RangeOption) => setRange(val)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36"
            placeholder="From"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36"
            placeholder="To"
          />
          <Select value={operatorId} onValueChange={(val) => setOperatorId(val)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All operators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All operators</SelectItem>
              {operators.map((op) => (
                <SelectItem key={op.id} value={op.id}>
                  {op.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={routeId} onValueChange={(val) => setRouteId(val)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All routes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All routes</SelectItem>
              {routes.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.origin} → {route.destination}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void refetch()}>
            <Filter className="mr-2 h-4 w-4" />
            Apply
          </Button>
          <Button variant="outline" onClick={() => void refetch()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => void handleExport()}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {(summary.revenue / 1_000_000).toFixed(1)}M VND
            <div className="text-sm text-muted-foreground mt-2">
              Paid transactions in range
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {summary.bookings}
            <div className="text-sm text-muted-foreground mt-2">
              All bookings in range
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Cancellations</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {summary.cancelled}
            <div className="text-sm text-muted-foreground mt-2">
              Cancelled bookings
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Refunded</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {(summary.refunded / 1_000_000).toFixed(1)}M
            <div className="text-sm text-muted-foreground mt-2">
              Refunded amount
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Revenue</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              {range.toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent className="h-80 flex flex-col">
            <ChartContainer
              config={{
                revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
              }}
              className="flex-1 overflow-hidden"
              style={{ aspectRatio: 'auto' }}
            >
              <LineChart data={data?.revenueSeries ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col">
            <ChartContainer
              config={
                bookingStatusSeries.length
                  ? Object.fromEntries(
                      bookingStatusSeries.map((item) => [
                        item.status.toLowerCase(),
                        { label: item.status, color: item.color },
                      ]),
                    )
                  : { bookings: { label: 'Bookings', color: palette[0] } }
              }
              className="flex-1 overflow-hidden"
              style={{ aspectRatio: 'auto' }}
            >
              <BarChart data={bookingStatusSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Cancellations: {summary.cancelled} • Refunds: {(summary.refunded / 1_000_000).toFixed(1)}M
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
                {(data?.topRoutes ?? []).map((route) => (
                  <TableRow key={route.route}>
                    <TableCell className="font-medium">{route.route}</TableCell>
                    <TableCell>{(route.revenue / 1_000_000).toFixed(1)}M</TableCell>
                    <TableCell>{route.bookings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Operators</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Bookings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.topOperators ?? []).map((op) => (
                  <TableRow key={op.operator}>
                    <TableCell className="font-medium">{op.operator}</TableCell>
                    <TableCell>{(op.revenue / 1_000_000).toFixed(1)}M</TableCell>
                    <TableCell>{op.bookings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
