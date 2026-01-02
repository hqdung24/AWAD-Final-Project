import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchAdminDashboard,
  type AdminDashboard as AdminDashboardData,
} from '@/services/dashboardService';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowUpRight,
  BusFront,
  DollarSign,
  Download,
  Route,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery<AdminDashboardData>({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
    retry: false,
  });
  const statusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isForbidden = (error as any)?.status === 403;
    if (isForbidden) {
      navigate('/403');
    }
  }

  const summaryCards = data?.summaryCards.map((item, idx) => {
    const icons = [Activity, BusFront, Users, DollarSign];
    return {
      ...item,
      icon: icons[idx] ?? Activity,
      display:
        item.currency === 'VND'
          ? `${(item.value / 1_000_000).toFixed(1)}M`
          : item.value.toLocaleString(),
    };
  }) ?? [
    {
      title: 'Total Bookings',
      value: 1234,
      delta: 0.12,
      display: '1,234',
      icon: Activity,
    },
    {
      title: 'Upcoming Trips',
      value: 48,
      delta: 0.04,
      display: '48',
      icon: BusFront,
    },
    {
      title: 'Active Users',
      value: 856,
      delta: 0.05,
      display: '856',
      icon: Users,
    },
    {
      title: 'Revenue Today',
      value: 45200000,
      delta: 0.08,
      display: '45.2M',
      icon: DollarSign,
    },
  ];

  const trendData = data?.trend ?? [
    { day: 'Mon', bookings: 120 },
    { day: 'Tue', bookings: 150 },
    { day: 'Wed', bookings: 170 },
    { day: 'Thu', bookings: 140 },
    { day: 'Fri', bookings: 210 },
    { day: 'Sat', bookings: 180 },
    { day: 'Sun', bookings: 200 },
  ];

  const topRoutes = data?.topRoutes ?? [
    { route: 'HCM → Hanoi', bookings: 234, revenue: 8_200_000 },
    { route: 'HCM → Dalat', bookings: 189, revenue: 3_400_000 },
    { route: 'HCM → Can Tho', bookings: 142, revenue: 2_800_000 },
  ];

  const recentBookings = data?.recentBookings ?? [
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
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">Admin Panel</p>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            Monitor bookings, routes, and revenue at a glance.
          </p>
          {isLoading && (
            <p className="text-xs text-muted-foreground">
              Loading live metrics…
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Last 7 days
          </Button>
          <Button variant="outline" size="sm">
            Last 30 days
          </Button>
          <Button variant="default" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map(
          (card: {
            title: string;
            value: number;
            delta?: number;
            display?: string;
            icon: React.ElementType;
          }) => (
            <Card key={card.title} className="shadow-sm">
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">{card.title}</p>
                  <p className="text-3xl font-semibold">
                    {'display' in card
                      ? (card as { display: string }).display
                      : card.value}
                  </p>
                  {typeof card.delta === 'number' && card.delta !== 0 && (
                    <div className="text-emerald-600 mt-1 flex items-center gap-1 text-xs font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      {`${Math.round(card.delta * 100)}%`} vs last period
                    </div>
                  )}
                </div>
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <card.icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bookings Trend (Last 7 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ChartContainer
              config={{
                bookings: { label: 'Bookings', color: 'hsl(var(--primary))' },
              }}
              className="h-full"
            >
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="var(--color-bookings)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/2">Route</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRoutes.map((item) => (
                  <TableRow key={item.route}>
                    <TableCell className="font-medium">{item.route}</TableCell>
                    <TableCell>{item.bookings}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-primary"
                            style={{
                              width: `${Math.min(item.bookings / 2.5, 100)}%`,
                            }}
                          />
                        </div>
                        <span>
                          {item.revenue >= 1_000_000
                            ? `${(item.revenue / 1_000_000).toFixed(1)}M`
                            : item.revenue.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.id}</TableCell>
                  <TableCell>{booking.user}</TableCell>
                  <TableCell>{booking.route}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusBadgeClass(booking.status)}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      

    </div>
  );
};

export default AdminDashboard;
