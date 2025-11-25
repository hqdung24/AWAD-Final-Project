import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, MapPin, Ticket, Bell } from 'lucide-react';
import { fetchUserDashboard, type UserDashboard } from '@/services/dashboardService';

const UserDashboard = () => {
  const { data, isLoading } = useQuery<UserDashboard>({
    queryKey: ['user-dashboard'],
    queryFn: fetchUserDashboard,
  });

  const upcomingTrips =
    data?.upcomingTrips ??
    [
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
    ];

  const notifications =
    data?.notifications ??
    [
      { type: 'upcoming', message: 'You have 2 unread notifications' },
      { type: 'alert', message: 'Get alerts for departure changes' },
    ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-primary">Your account</p>
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Trips</h1>
        <p className="text-muted-foreground text-sm">
          Manage tickets, see what’s next, and jump back into booking quickly.
        </p>
        {isLoading && <p className="text-xs text-muted-foreground">Loading your trips…</p>}
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {upcomingTrips.map((trip) => (
            <Card key={trip.bookingId} className="shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">
                    {trip.route}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {trip.datetime}
                  </p>
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Seats: {trip.seats}
                  </p>
                  <p className="text-muted-foreground text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Booking ID: {trip.bookingId}
                  </p>
                </div>
                <Badge variant="secondary">Upcoming</Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {trip.actions.map((action) => (
                  <Button
                    key={action}
                    variant={action === 'View E-ticket' ? 'default' : 'outline'}
                    size="sm"
                  >
                    {action}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardContent className="flex flex-col gap-2 p-6 text-center">
              <p className="text-muted-foreground text-sm">No more upcoming trips</p>
              <Button className="inline-flex items-center gap-2 self-center">
                Search New Trip <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle>Navigation</CardTitle>
            <div className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
              {notifications.find((n) => n.type === 'upcoming')?.message ?? 'Stay updated on your trips'}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 font-medium">
              Upcoming <Badge variant="default">●</Badge>
            </div>
            {['History', 'Profile', 'Payments', 'Notifications'].map((item) => (
              <button
                key={item}
                className="text-muted-foreground hover:text-foreground w-full rounded-lg px-3 py-2 text-left transition-colors"
              >
                {item}
              </button>
            ))}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              <Bell className="h-4 w-4" />
              {notifications.find((n) => n.type === 'alert')?.message ??
                'Get alerts for departure changes'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
