import { useBooking } from '@/hooks/useBooking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Ticket,
  UserRound,
  Calendar,
  Wallet,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

function formatCurrency(amount?: number) {
  if (amount === undefined) return '--';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatDateTime(iso?: string) {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function UpcomingTripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { bookingDetail } = useBooking(undefined, id);
  const { data, isLoading, isError } = bookingDetail;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
          <div className="text-sm text-muted-foreground">Loading ticket...</div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10 space-y-4">
          <Button
            variant="ghost"
            className="inline-flex items-center gap-2"
            onClick={() => navigate('/upcoming-trip')}
          >
            <ArrowLeft className="h-4 w-4" /> Back to list
          </Button>
          <Card className="border-destructive/50">
            <CardContent className="p-6 text-destructive text-sm">
              Unable to load booking detail. Please try again.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const trip = data.trip;
  const seatCodes = data.seats.map((s) => s.seatCode).join(', ');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Button
          variant="ghost"
          className="inline-flex items-center gap-2"
          onClick={() => navigate('/upcoming-trip')}
        >
          <ArrowLeft className="h-4 w-4" /> Back to list
        </Button>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">E-ticket</p>
            <CardTitle className="text-2xl">
              {trip.origin} → {trip.destination}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Booking ID: {data.bookingReference || data.bookingId}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Route
                </div>
                <div className="text-lg font-semibold">
                  {trip.origin} → {trip.destination}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Ticket className="h-4 w-4" /> Trip ID: {trip.id}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> Departure / Arrival
                </div>
                <div className="text-lg font-semibold">
                  {formatDateTime(trip.departureTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Arrival: {formatDateTime(trip.arrivalTime)}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="h-4 w-4" /> Passengers
                </div>
                <div className="space-y-1">
                  {data.passengers.map((p) => (
                    <div
                      key={p.seatCode}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="font-medium">{p.fullName}</span>
                      <span className="text-muted-foreground">
                        Seat {p.seatCode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Ticket className="h-4 w-4" /> Seats & Fare
                </div>
                <div className="text-lg font-semibold">{seatCodes}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Base fare: {formatCurrency(trip.basePrice)} x{' '}
                  {data.seats.length}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  Total: {formatCurrency(data.totalAmount)}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Booking status
                </div>
                <div className="text-lg font-semibold capitalize">
                  {data.status}
                </div>
                <div className="text-sm text-muted-foreground">
                  Created at: {formatDateTime(data.createdAt)}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4" /> Payment
                </div>
                <div className="text-sm text-muted-foreground">
                  Payment method: Pending
                </div>
                <div className="text-sm text-muted-foreground">
                  Booking reference: {data.bookingReference ?? '—'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
