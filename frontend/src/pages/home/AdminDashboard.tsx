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
import { Badge } from '@/components/ui/badge';
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, ArrowUpRight, Download, DollarSign, Route, Users } from 'lucide-react';

const summaryCards = [
  { title: 'Total Bookings', value: '1,234', icon: Activity, delta: '+12%' },
  { title: 'Active Users', value: '856', icon: Users, delta: '+5%' },
  { title: 'Revenue Today', value: '45.2M', icon: DollarSign, delta: '+8%' },
];

const trendData = [
  { day: 'Mon', bookings: 120 },
  { day: 'Tue', bookings: 150 },
  { day: 'Wed', bookings: 170 },
  { day: 'Thu', bookings: 140 },
  { day: 'Fri', bookings: 210 },
  { day: 'Sat', bookings: 180 },
  { day: 'Sun', bookings: 200 },
];

const topRoutes = [
  { route: 'HCM → Hanoi', bookings: 234, revenue: '8.2M' },
  { route: 'HCM → Dalat', bookings: 189, revenue: '3.4M' },
  { route: 'HCM → Can Tho', bookings: 142, revenue: '2.8M' },
];

const recentBookings = [
  { id: 'BK20251115001', user: 'Tran Anh', route: 'HCM → Hanoi', status: 'Paid' },
  { id: 'BK20251115002', user: 'Le Minh', route: 'HCM → Dalat', status: 'Pending' },
  { id: 'BK20251115003', user: 'Nguyen Ha', route: 'Hanoi → Hue', status: 'Cancelled' },
];

const AdminDashboard = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">Admin Panel</p>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm">
            Monitor bookings, routes, and revenue at a glance.
          </p>
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
        {summaryCards.map((card) => (
          <Card key={card.title} className="shadow-sm">
            <CardContent className="flex items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-sm">{card.title}</p>
                <p className="text-3xl font-semibold">{card.value}</p>
                <div className="text-emerald-600 mt-1 flex items-center gap-1 text-xs font-medium">
                  <ArrowUpRight className="h-4 w-4" />
                  {card.delta} vs last period
                </div>
              </div>
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <card.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
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
                            style={{ width: `${Math.min(item.bookings / 2.5, 100)}%` }}
                          />
                        </div>
                        <span>{item.revenue}</span>
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
                      variant={
                        booking.status === 'Paid'
                          ? 'default'
                          : booking.status === 'Pending'
                          ? 'secondary'
                          : 'destructive'
                      }
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
