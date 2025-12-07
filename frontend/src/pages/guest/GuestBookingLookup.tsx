import { useMemo, useState } from 'react';
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
import { AlertCircle, CheckCircle2, Clock, Mail, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type MockBooking = {
  reference: string;
  email: string;
  trip: string;
  departure: string;
  arrival: string;
  seats: string[];
  passengerNames: string[];
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
};

const mockBookings: MockBooking[] = [
  {
    reference: 'BT-902134',
    email: 'guest@example.com',
    trip: 'HCM → Da Nang',
    departure: '2025-12-20T09:00:00Z',
    arrival: '2025-12-20T17:30:00Z',
    seats: ['A1', 'A2'],
    passengerNames: ['Tran Minh Anh', 'Nguyen Van B'],
    status: 'CONFIRMED',
  },
  {
    reference: 'BT-448811',
    email: 'user@demo.com',
    trip: 'Ha Noi → Hue',
    departure: '2025-12-22T07:45:00Z',
    arrival: '2025-12-22T15:00:00Z',
    seats: ['C3'],
    passengerNames: ['Le Thi Cam'],
    status: 'PENDING',
  },
];

const statusStyles: Record<MockBooking['status'], string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
};

function formatDateTime(value: string) {
  const d = new Date(value);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

export default function GuestBookingLookup() {
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const navigate = useNavigate();

  const result = useMemo(() => {
    if (!hasSubmitted) return undefined;
    const refNorm = reference.trim().toUpperCase();
    const emailNorm = email.trim().toLowerCase();
    return mockBookings.find(
      (b) =>
        b.reference.toUpperCase() === refNorm &&
        b.email.toLowerCase() === emailNorm,
    );
  }, [email, hasSubmitted, reference]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Guest booking support
            </p>
            <h1 className="text-2xl font-semibold">
              Retrieve your booking by reference
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the booking reference from your email/SMS and the email you
              used during checkout.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find your booking</CardTitle>
            <CardDescription>
              Use mock data for now — try reference <code>BT-902134</code> with
              email <code>guest@example.com</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
            >
              <div className="space-y-2">
                <Label htmlFor="reference">Booking reference</Label>
                <div className="relative">
                  <Input
                    id="reference"
                    placeholder="e.g. BT-902134"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
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
                    required
                  />
                  <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Search booking
              </Button>
            </form>
          </CardContent>
        </Card>

        {hasSubmitted && (
          <Card>
            <CardHeader>
              <CardTitle>Lookup result</CardTitle>
              <CardDescription>
                Showing mock data result for your reference.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      Ref: {result.reference}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={statusStyles[result.status]}
                    >
                      {result.status}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {result.email}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Trip route
                      </p>
                      <p className="font-semibold">{result.trip}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Seats
                      </p>
                      <p className="font-semibold">{result.seats.join(', ')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="size-4" />
                        Departure
                      </p>
                      <p className="font-semibold">
                        {formatDateTime(result.departure)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="size-4" />
                        Arrival
                      </p>
                      <p className="font-semibold">
                        {formatDateTime(result.arrival)}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Passengers</p>
                    <div className="flex flex-wrap gap-2">
                      {result.passengerNames.map((name) => (
                        <Badge key={name} variant="secondary">
                          <CheckCircle2 className="mr-1 size-3" />
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  <AlertCircle className="text-destructive size-5" />
                  No booking found with that reference and email. Double-check
                  your entry or try another combination from the mock data.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
