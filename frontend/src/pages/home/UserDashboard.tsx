import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBooking } from '@/hooks/useBooking';
import { useUserStore } from '@/stores/user';
import { ArrowRight, Bell, Clock, MapPin, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
function UserDashboard() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.me);
  const { bookingList } = useBooking(user ? { userId: user.id } : undefined);

  const upcomingTrips = (bookingList.data?.data ?? []).map((b) => ({
    route: `${b.trip.origin} → ${b.trip.destination}`,
    datetime: new Date(b.trip.departureTime).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }),
    seats: b.seats.map((s) => s.seatCode).join(', '),
    bookingId: b.id,
    bookingRef: b.bookingReference || b.id,
  }));

  const notifications = [
    {
      type: 'upcoming' as const,
      message:
        bookingList.data?.total && bookingList.data?.total > 0
          ? `You have ${bookingList.data.total} upcoming booking(s)`
          : 'No upcoming trips yet',
    },
    {
      type: 'alert' as const,
      message: 'Get alerts for departure changes',
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-primary">Your account</p>
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Trips</h1>
        <p className="text-muted-foreground text-sm">
          Manage tickets, see what’s next, and jump back into booking quickly.
        </p>
        {bookingList.isLoading && (
          <p className="text-xs text-muted-foreground">Loading your trips…</p>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {bookingList.isError && (
            <Card className="shadow-sm border-destructive/50">
              <CardContent className="p-6 text-sm text-destructive">
                Unable to load your bookings. Please try again.
              </CardContent>
            </Card>
          )}

          {!bookingList.isLoading && upcomingTrips.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col gap-2 p-6 text-center">
                <p className="text-muted-foreground text-sm">
                  No upcoming trips yet
                </p>
                <Button
                  className="inline-flex items-center gap-2 self-center"
                  onClick={() => navigate('/search')}
                >
                  Search New Trip <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

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
                    Booking ID: {trip.bookingRef}
                  </p>
                </div>
                <Badge variant="secondary">Upcoming</Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/upcoming-trip/${trip.bookingId}`)}
                >
                  View E-ticket
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle>Navigation</CardTitle>
            <div className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
              {notifications.find((n) => n.type === 'upcoming')?.message ??
                'Stay updated on your trips'}
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
}

export default UserDashboard;
