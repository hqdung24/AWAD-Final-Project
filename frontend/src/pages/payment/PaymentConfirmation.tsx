import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function PaymentConfirmation() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState<string>('11:59:59');

  useEffect(() => {
    // Calculate time remaining (12 hours from now)
    const endTime = new Date(Date.now() + 12 * 60 * 60 * 1000);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('00:00:00');
        clearInterval(interval);
        return;
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
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
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
            {/* Booking ID */}
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground uppercase font-semibold">
                Booking ID
              </p>
              <p className="text-lg font-mono font-bold text-primary break-all">
                {bookingId || 'N/A'}
              </p>
            </div>

            {/* Payment Notice */}
            <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                    Complete Payment
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Please complete your payment to finalize the booking and
                    receive your e-ticket.
                  </p>
                </div>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4" />
                  Time Remaining
                </div>
              </div>
              <div className="text-3xl font-mono font-bold text-primary text-center py-4 bg-muted rounded-lg">
                {timeRemaining}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Payment must be completed within 12 hours
              </p>
            </div>

            {/* Key Details */}
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-semibold">Next Steps:</h4>
              <ol className="text-xs text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>
                    Proceed to payment page to complete the transaction
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>Verify payment details and confirm</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>
                    Receive e-ticket via email after successful payment
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>
                    Check your bookings in the "Upcoming Trips" section
                  </span>
                </li>
              </ol>
            </div>

            {/* Button */}
            <Button
              onClick={() => navigate('/upcoming-trip')}
              className="w-full py-6 text-base font-semibold"
            >
              Back to Upcoming Trips
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your booking is reserved. Payment is required to complete the
              process.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
