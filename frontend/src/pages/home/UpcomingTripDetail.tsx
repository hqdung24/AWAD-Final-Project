import { useBooking } from '@/hooks/useBooking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Clock,
  Download,
  MapPin,
  Ticket,
  UserRound,
  Calendar,
  Wallet,
  QrCode,
  Star,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket';
import { useUserStore } from '@/stores/user';
import { bookingDetailResponseSchema } from '@/schemas/booking/booking.response';
import QRCode from 'react-qr-code';
import ETicketTemplate from '@/components/eticket/ETicketTemplate';
import { generateETicketPDF } from '@/services/pdf/eticketService';

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

// Format status text by removing underscores and capitalizing
function formatTripStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Simple schema for trip status update event from backend
const tripStatusUpdateEventSchema = z.object({
  tripId: z.string(),
  oldStatus: z.string(),
  newStatus: z.string(),
  trip: z.object({
    id: z.string(),
    status: z.string(),
  }),
  timestamp: z.string().or(z.date()),
});

type BookingDetailResponse = z.infer<typeof bookingDetailResponseSchema>;

export default function UpcomingTripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.me);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const pdfTemplateRef = useRef<HTMLDivElement>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleDownloadPDF = async () => {
    if (!pdfTemplateRef.current || !data) return;
    try {
      await generateETicketPDF(
        pdfTemplateRef.current,
        data.bookingReference || data.bookingId
      );
    } catch (err) {
      console.error('Failed to download ticket PDF', err);
    }
  };

  const { bookingDetail } = useBooking(undefined, id);
  const { data, isLoading, isError } = bookingDetail;
  console.log('Booking detail data:', data?.status);
  console.log('Ticket verify URL:', data?.ticketVerifyUrl);
  console.log(
    'Should show QR section:',
    (data?.status === 'paid' || data?.status === 'reviewed') &&
      !!data?.ticketVerifyUrl
  );

  // Listen for realtime trip status updates
  useEffect(() => {
    const socket = getSocket(user?.id ?? undefined);
    socketRef.current = socket;

    const handleTripStatusUpdate = (eventData: unknown) => {
      // Validate event data
      const result = tripStatusUpdateEventSchema.safeParse(eventData);
      if (!result.success) {
        console.warn('Invalid trip status update event:', result.error);
        return;
      }

      const event = result.data;

      // Update booking detail cache
      queryClient.setQueriesData<BookingDetailResponse>(
        { queryKey: ['booking', id] },
        (oldData) => {
          if (!oldData || oldData.trip.id !== event.tripId) return oldData;

          return {
            ...oldData,
            trip: {
              ...oldData.trip,
              status: event.newStatus,
            },
          };
        }
      );
    };

    socket.on('trip:status.updated', handleTripStatusUpdate);

    return () => {
      socket.off('trip:status.updated', handleTripStatusUpdate);
    };
  }, [id, user?.id, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-10">
          <div className="text-sm text-muted-foreground">
            Loading booking...
          </div>
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
            onClick={() => navigate(-1)}
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
  const isPending = data.status === 'pending';
  const pickupPoint = data.pickupPoint;
  const dropoffPoint = data.dropoffPoint;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigate('/upcoming-trip')}
                aria-label="Back to list"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span>Booking Detail</span>
            </div>
            <CardTitle className="text-2xl inline-flex items-center gap-3">
              <span>
                {trip.origin} → {trip.destination}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <span
                  className={`h-2 w-2 rounded-full ${
                    trip.status.toLowerCase() === 'scheduled'
                      ? 'bg-blue-500'
                      : trip.status.toLowerCase() === 'in_progress'
                      ? 'bg-purple-500'
                      : trip.status.toLowerCase() === 'completed'
                      ? 'bg-green-500'
                      : trip.status.toLowerCase() === 'cancelled'
                      ? 'bg-red-500'
                      : 'bg-slate-500'
                  }`}
                />
                {formatTripStatus(trip.status)}
              </span>
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Booking Reference: {data.bookingReference || data.bookingId}
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
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" /> Departure / Arrival
                </div>
                <div className="text-lg font-semibold">
                  Departure: {formatDateTime(trip.departureTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Arrival (estimated): {formatDateTime(trip.arrivalTime)}
                </div>
              </div>
            </div>

            <Separator />

            {(pickupPoint || dropoffPoint) && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> Pickup point
                    </div>
                    <div className="text-sm font-semibold">
                      {pickupPoint ? pickupPoint.name : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pickupPoint?.address ?? ''}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> Dropoff point
                    </div>
                    <div className="text-sm font-semibold">
                      {dropoffPoint ? dropoffPoint.name : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dropoffPoint?.address ?? ''}
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

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
                  Payment method: Banking
                </div>
              </div>
            </div>

            {isPending && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate(`/payment/${data.bookingId}`)}
                  >
                    Pay Now
                  </Button>
                </div>
              </>
            )}

            {(data.status === 'paid' || data.status === 'reviewed') && (
              <>
                <Separator />
                <div className="space-y-3">
                  {data.status === 'reviewed' ? (
                    <div className="flex items-center justify-center">
                      <Button
                        variant="default"
                        size="lg"
                        onClick={() =>
                          navigate(`/my-reviews?highlight=${data.bookingId}`)
                        }
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                      >
                        <Star className="h-5 w-5 mr-2" />
                        View Your Review
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <QrCode className="h-4 w-4" />
                          Ticket QR Code
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadPDF}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Ticket
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowQRCode(!showQRCode)}
                          >
                            {showQRCode ? 'Hide' : 'Show'} QR Code
                          </Button>
                          {trip.status === 'completed' &&
                            data.status !== 'reviewed' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  navigate(`/upcoming-trip/${id}/feedback`)
                                }
                                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Review & Rate
                              </Button>
                            )}
                        </div>
                      </div>
                      {showQRCode && (
                        <div className="flex justify-center p-4 bg-muted rounded-lg">
                          <QRCode
                            value={data.ticketVerifyUrl}
                            size={256}
                            level="H"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* Hidden template for PDF generation */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-10000px',
                      top: '-10000px',
                      overflow: 'hidden',
                      pointerEvents: 'none',
                      opacity: 0,
                    }}
                  >
                    <div ref={pdfTemplateRef}>
                      <ETicketTemplate
                        bookingReference={
                          data.bookingReference || data.bookingId
                        }
                        bookingId={data.bookingId}
                        status={data.status}
                        origin={trip.origin}
                        destination={trip.destination}
                        departureTime={new Date(trip.departureTime)}
                        arrivalTime={
                          trip.arrivalTime
                            ? new Date(trip.arrivalTime)
                            : undefined
                        }
                        passengers={data.passengers}
                        totalAmount={data.totalAmount}
                        ticketVerifyUrl={data.ticketVerifyUrl}
                        name={data.name || ''}
                        email={data.email || ''}
                        phone={data.phone || ''}
                        pickupPoint={pickupPoint?.name}
                        dropoffPoint={dropoffPoint?.name}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
