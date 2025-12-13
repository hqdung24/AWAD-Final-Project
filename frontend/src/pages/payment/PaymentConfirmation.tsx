import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBooking } from '@/hooks/useBooking';
import { createPayment } from '@/services/paymentService';
export default function PaymentConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { bookingDetail } = useBooking(undefined, bookingId);

  const { data } = bookingDetail;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--:--');

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!bookingId) throw new Error('Missing booking id');
      return createPayment(bookingId);
    },
    onSuccess: (res) => {
      if (res.checkoutUrl) {
        window.location.replace(res.checkoutUrl);
      }
    },
  });

  useEffect(() => {
    if (!data?.createdAt) return;

    const createdAt = new Date(data.createdAt);
    const endTime = new Date(createdAt.getTime() + 12 * 60 * 60 * 1000);

    const tick = () => {
      const diff = endTime.getTime() - Date.now();

      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        return false;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')}`
      );
      return true;
    };

    // Run immediately to avoid 1s delay
    const hasTime = tick();
    if (!hasTime) return;

    const interval = setInterval(() => {
      const keepRunning = tick();
      if (!keepRunning) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.createdAt]);

  return (
    <div className="min-h-screen overflow-hidden bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Booking Successful!</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your booking has been created successfully
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Booking details first */}
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlertCircle className="h-4 w-4 text-primary" /> Booking details
              </div>
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase font-semibold">
                    Booking Ref
                  </dt>
                  <dd className="font-mono font-bold text-primary break-all">
                    {data?.bookingReference || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase font-semibold">
                    Status
                  </dt>
                  <dd className="font-semibold text-foreground">
                    {data?.status ?? 'Pending'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase font-semibold">
                    Route
                  </dt>
                  <dd className="text-foreground">
                    {data?.trip
                      ? `${data.trip.origin} → ${data.trip.destination}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground uppercase font-semibold">
                    Seats
                  </dt>
                  <dd className="text-foreground">
                    {data?.seats?.map((s) => s.seatCode).join(', ') || '—'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Timer second */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4" />
                Time Remaining to Pay
              </div>
              <div className="text-3xl font-mono font-bold text-primary text-center py-4 bg-muted rounded-lg">
                {timeRemaining}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Payment must be completed within 12 hours
              </p>
            </div>

            {/* Actions last */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  paymentMutation.mutate();
                }}
                disabled={paymentMutation.isPending}
                className="w-full py-6 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
              >
                {paymentMutation.isPending
                  ? 'Redirecting…'
                  : 'Continue to Payment'}
              </Button>

              <Button
                onClick={async () => {
                  await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['bookings'] }),
                    bookingId
                      ? queryClient.invalidateQueries({
                          queryKey: ['booking', bookingId],
                        })
                      : Promise.resolve(),
                  ]);
                  navigate('/upcoming-trip');
                }}
                className="w-full py-6 text-base font-semibold bg-muted text-foreground hover:bg-muted/80"
              >
                Back to Upcoming Trips
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your booking is reserved. Complete payment to receive your
                e-ticket.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
