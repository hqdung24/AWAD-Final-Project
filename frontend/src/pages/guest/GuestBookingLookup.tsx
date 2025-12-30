import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Search,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '@/hooks/useBooking';
import type { BookingListQuery } from '@/schemas/booking/booking.query';

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
};

function formatDateTime(iso?: string) {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function GuestBookingLookup() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [searchParams, setSearchParams] = useState<
    BookingListQuery | undefined
  >(undefined);
  const navigate = useNavigate();

  const { bookingList } = useBooking(searchParams);
  const isLoading = bookingList.isLoading;
  const bookings = bookingList.data?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one field is provided
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedEmail && !trimmedPhone) {
      return;
    }

    // Build search params - use whichever is provided
    const params: BookingListQuery = {};
    if (trimmedEmail) {
      params.email = trimmedEmail;
    }
    if (trimmedPhone) {
      params.phone = trimmedPhone;
    }

    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Guest booking support
            </p>
            <h1 className="text-2xl font-semibold">Find your booking</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email or phone number used during checkout.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search for bookings</CardTitle>
            <CardDescription>
              Enter either your email address or phone number to find your
              bookings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                  />
                  <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isLoading || (!email.trim() && !phone.trim())}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search booking'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searchParams && (
          <Card>
            <CardHeader>
              <CardTitle>Search results</CardTitle>
              <CardDescription>
                {isLoading
                  ? 'Searching for your bookings...'
                  : `Found ${bookings.length} booking(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-6">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          variant="outline"
                          className={statusStyles[booking.status]}
                        >
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Trip route
                          </p>
                          <p className="font-semibold">
                            {booking.trip.origin} → {booking.trip.destination}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Seats</p>
                          <p className="font-semibold">
                            {booking.seats.map((s) => s.seatCode).join(', ') ||
                              'N/A'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="size-4" />
                            Departure
                          </p>
                          <p className="font-semibold">
                            {formatDateTime(booking.trip.departureTime)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="size-4" />
                            Total amount
                          </p>
                          <p className="font-semibold">
                            {booking.totalAmount.toLocaleString('vi-VN')} VND
                          </p>
                        </div>
                        {(booking.pickupPoint || booking.dropoffPoint) && (
                          <div className="space-y-1 md:col-span-2">
                            <p className="text-sm text-muted-foreground">
                              Pickup / Dropoff
                            </p>
                            <p className="font-semibold">
                              {booking.pickupPoint?.name ?? '—'} →{' '}
                              {booking.dropoffPoint?.name ?? '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.pickupPoint?.address ?? ''}
                              {booking.pickupPoint?.address && booking.dropoffPoint?.address
                                ? ' • '
                                : ''}
                              {booking.dropoffPoint?.address ?? ''}
                            </p>
                          </div>
                        )}
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Passengers
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {booking.passengers.length > 0 ? (
                            booking.passengers.map((passenger, idx) => (
                              <Badge key={idx} variant="secondary">
                                <CheckCircle2 className="mr-1 size-3" />
                                {passenger.fullName}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No passenger details
                            </span>
                          )}
                        </div>
                      </div>
                      {bookings.length > 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  <AlertCircle className="text-destructive size-5" />
                  No bookings found with the provided information. Please check
                  your email or phone number and try again.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
