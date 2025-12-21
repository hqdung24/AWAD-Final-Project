import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bus,
  ArrowLeft,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getTripDetails } from '@/services/tripService';
import {
  getSeatsByTrip,
  lockSeats,
  type SeatStatus,
} from '@/services/seatService';
import { notify } from '@/lib/notify';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { getSocket } from '@/lib/socket';
import { useRef } from 'react';
import { Socket } from 'socket.io-client';
export default function SeatSelection() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUserId = useUserStore((s) => s.me?.id);
  const socketRef = useRef<Socket | null>(null);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const selectedSeatsRef = useRef<string[]>([]);
  const [selectedByOthers, setSelectedByOthers] = useState<Set<string>>(
    new Set()
  );
  const [isLocking, setIsLocking] = useState(false);
  const [lockToken, setLockToken] = useState<string | null>(null);

  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQuery({
    queryKey: ['trip-details', id],
    queryFn: () => getTripDetails(id!),
    enabled: !!id,
  });

  const {
    data: seatStatuses,
    isLoading: seatsLoading,
    error: seatsError,
    refetch: refetchSeats,
  } = useQuery({
    queryKey: ['trip-seats', id],
    queryFn: () => getSeatsByTrip(id!),
    enabled: !!id,
    refetchInterval: lockToken ? false : 30000, // Stop refetching when seats are locked
  });

  useEffect(() => {
    setSelectedByOthers(new Set());
    setSelectedSeats([]);
  }, [id]);

  // Initialize seats selected by other users from snapshot on first load
  useEffect(() => {
    if (!seatStatuses) return;
    setSelectedByOthers((prev) => {
      if (prev.size > 0) return prev; // do not override after socket updates
      const selectedIds = seatStatuses
        .filter((s) => s.state === 'selected')
        .map((s) => s.seatId);
      return new Set(selectedIds);
    });
  }, [seatStatuses]);

  // Keep a ref of currently selected seats to use in cleanup/unload handlers
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
    if (!id) return;

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    socket.emit('trip:join', { tripId: id });

    socket.on('seat:selected', ({ seatId, userId }) => {
      console.log('receive broadcast message from socket: ', seatId);

      if (userId && userId === currentUserId) return;
      setSelectedByOthers((prev) => new Set([...prev, seatId]));
    });

    socket.on('seat:released', ({ seatId, userId }) => {
      console.log('receive broadcast message from socket: ', seatId);

      if (userId && userId === currentUserId) return;
      setSelectedByOthers((prev) => {
        const next = new Set(prev);
        next.delete(seatId);
        return next;
      });
    });

    // when seats are locked by someone, remove from temp selected-by-others and refresh snapshot
    socket.on('seat:locked', ({ seatIds }) => {
      setSelectedByOthers((prev) => {
        const next = new Set(prev);
        if (Array.isArray(seatIds)) {
          seatIds.forEach((id: string) => next.delete(id));
        } else if (typeof seatIds === 'string') {
          next.delete(seatIds);
        }
        return next;
      });
      void refetchSeats();
    });

    socket.on('error', (err) => {
      notify.error(err.message ?? 'Realtime error');
    });

    return () => {
      // release any current selections before leaving the room
      selectedSeatsRef.current.forEach((seatId) => {
        socket.emit('seat:release', { tripId: id, seatId });
      });

      socket.emit('trip:leave', { tripId: id });
      socket.off('seat:selected');
      socket.off('seat:released');
      socket.off('seat:locked');
      socket.off('error');
    };
  }, [id, accessToken, currentUserId, refetchSeats]);

  // Release selections on page reload/navigation (best-effort)
  useEffect(() => {
    const handleUnload = () => {
      if (!socketRef.current || !id) return;
      selectedSeatsRef.current.forEach((seatId) => {
        socketRef.current!.emit('seat:release', { tripId: id, seatId });
      });
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [id]);

  useEffect(() => {
    if (tripError || seatsError) {
      notify.error('Failed to load seat information. Please try again.');
    }
  }, [tripError, seatsError]);

  const emitSeatSelection = (seatId: string) => {
    socketRef.current?.emit('seat:select', { tripId: id, seatId });
  };

  const emitSeatRelease = (seatId: string) => {
    socketRef.current?.emit('seat:release', { tripId: id, seatId });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // const formatTimeRemaining = (seconds: number) => {
  //   const minutes = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${minutes}:${secs.toString().padStart(2, '0')}`;
  // };

  const handleSeatClick = (seatId: string, state: string) => {
    if (lockToken) return; // Seats are locked, can't change selection
    if (state !== 'available' && state !== 'selected') return; // Can't select non-available seats

    // Check if releasing
    if (selectedSeats.includes(seatId)) {
      emitSeatRelease(seatId);
      setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
      return;
    }

    // Check if can select more
    if (selectedSeats.length >= passengers) {
      notify.error(`You can only select ${passengers} seat(s)`);
      return;
    }

    // Select seat
    emitSeatSelection(seatId);
    setSelectedSeats((prev) => [...prev, seatId]);
  };

  const handleContinueToCheckout = async () => {
    if (selectedSeats.length === 0) {
      notify.error('Please select at least one seat');
      return;
    }

    if (selectedSeats.length !== passengers) {
      notify.error(`Please select exactly ${passengers} seat(s)`);
      return;
    }

    setIsLocking(true);

    try {
      const response = await lockSeats(id!, selectedSeats);

      if (!response.success) {
        notify.error(response.message || 'Failed to lock seats');
        setSelectedSeats([]);
        refetchSeats();
        return;
      }

      // Success
      setLockToken(response.lock_token);
      notify.success('Seats selected. Redirecting to checkout...');

      // Navigate to checkout page with lock_token and seat_ids
      navigate(
        `/search/${id}/checkout?from=${from}&to=${to}&date=${date}&passengers=${passengers}&lock_token=${
          response.lock_token
        }&seat_ids=${selectedSeats.join(',')}`
      );
    } catch {
      notify.error('An error occurred while locking seats');
      setSelectedSeats([]);
      refetchSeats();
    } finally {
      setIsLocking(false);
    }
  };

  const getSeatsByRow = () => {
    if (!seatStatuses) return [];

    // Group seats by row letter (A, B, C, D, E, F, G, H, I, J)
    const rowMap = new Map<string, SeatStatus[]>();

    seatStatuses.forEach((seatStatus) => {
      const seatCode = seatStatus.seat.seatCode;
      // Extract row letter from seat code (e.g., A1 -> A, B2 -> B)
      const rowLetter = seatCode.charAt(0);

      if (!rowMap.has(rowLetter)) {
        rowMap.set(rowLetter, []);
      }
      rowMap.get(rowLetter)!.push(seatStatus);
    });

    // Sort each row by seat number (1, 2, 3, 4)
    rowMap.forEach((seats) => {
      seats.sort((a, b) => {
        const numA = parseInt(a.seat.seatCode.substring(1));
        const numB = parseInt(b.seat.seatCode.substring(1));
        return numA - numB;
      });
    });

    // Return sorted rows (A, B, C, D, E, F, G, H, I, J)
    return Array.from(rowMap.entries()).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
  };

  const getSeatState = (seatStatus: SeatStatus) => {
    if (selectedSeats.includes(seatStatus.seatId)) {
      return 'selected';
    }
    if (selectedByOthers.has(seatStatus.seatId)) {
      return 'selected_by_other';
    }
    if (seatStatus.state === 'booked' || seatStatus.state === 'locked') {
      return 'occupied';
    }
    return 'available';
  };

  const getSeatColor = (state: string) => {
    switch (state) {
      case 'selected':
        return 'bg-primary text-primary-foreground border-primary';
      case 'selected_by_other':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed';
      case 'occupied':
        return 'bg-muted text-muted-foreground border-muted cursor-not-allowed';
      case 'available':
      default:
        return 'bg-background hover:bg-primary/10 border-border cursor-pointer';
    }
  };

  if (tripLoading || seatsLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Bus className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">
                Loading seat information...
              </h3>
              <p className="text-muted-foreground">Please wait</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!trip || !seatStatuses) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">
                Seat information not available
              </h3>
              <p className="text-muted-foreground mb-4">
                Unable to load seat data for this trip
              </p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const seatRows = getSeatsByRow();

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() =>
              navigate(
                `/search/${id}?from=${from}&to=${to}&date=${date}&passengers=${passengers}`
              )
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Trip Details
          </Button>
        </div>

        {/* Trip Details Header */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              Trip Details: {trip.from} → {trip.to} | {trip.company} |{' '}
              {formatTime(trip.departureTime)} - {formatTime(trip.arrivalTime)}
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Seat Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>SEAT MAP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Driver indicator */}
                  <div className="flex justify-end mb-4">
                    <div className="px-4 py-2 bg-muted rounded-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Driver</span>
                    </div>
                  </div>

                  {/* Seat grid - 4 seats per row with center aisle */}
                  <div className="space-y-4">
                    {seatRows.map(([rowLetter, seats]) => {
                      // Split seats into left (positions 1, 2) and right (positions 3, 4)
                      const leftSeats = seats.filter((s) => {
                        const position = parseInt(s.seat.seatCode.substring(1));
                        return position <= 2;
                      });
                      const rightSeats = seats.filter((s) => {
                        const position = parseInt(s.seat.seatCode.substring(1));
                        return position >= 3;
                      });

                      return (
                        <div
                          key={rowLetter}
                          className="flex justify-center gap-8"
                        >
                          {/* Left side - 2 seats (positions 1, 2) */}
                          <div className="flex gap-2">
                            {leftSeats.map((seatStatus) => {
                              const state = getSeatState(seatStatus);
                              return (
                                <button
                                  key={seatStatus.seatId}
                                  onClick={() =>
                                    handleSeatClick(seatStatus.seatId, state)
                                  }
                                  disabled={
                                    state !== 'available' &&
                                    state !== 'selected'
                                  }
                                  className={cn(
                                    'w-14 h-14 rounded-lg border-2 font-semibold transition-all text-sm',
                                    getSeatColor(state),
                                    lockToken && 'cursor-not-allowed opacity-50'
                                  )}
                                  title={`${seatStatus.seat.seatCode} - ${state}`}
                                >
                                  {seatStatus.seat.seatCode}
                                </button>
                              );
                            })}
                          </div>

                          {/* Aisle */}
                          <div className="w-8 border-l-2 border-r-2 border-dashed border-muted-foreground/20" />

                          {/* Right side - 2 seats (positions 3, 4) */}
                          <div className="flex gap-2">
                            {rightSeats.map((seatStatus) => {
                              const state = getSeatState(seatStatus);
                              return (
                                <button
                                  key={seatStatus.seatId}
                                  onClick={() =>
                                    handleSeatClick(seatStatus.seatId, state)
                                  }
                                  disabled={
                                    state !== 'available' &&
                                    state !== 'selected'
                                  }
                                  className={cn(
                                    'w-14 h-14 rounded-lg border-2 font-semibold transition-all text-sm',
                                    getSeatColor(state),
                                    lockToken && 'cursor-not-allowed opacity-50'
                                  )}
                                  title={`${seatStatus.seat.seatCode} - ${state}`}
                                >
                                  {seatStatus.seat.seatCode}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-semibold mb-3">Legend:</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg border-2 bg-background border-border" />
                        <span className="text-sm">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg border-2 bg-muted text-muted-foreground border-muted" />
                        <span className="text-sm">Occupied</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg border-2 bg-primary text-primary-foreground border-primary" />
                        <span className="text-sm">Your selection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg border-2 bg-yellow-100 text-yellow-800 border-yellow-300" />
                        <span className="text-sm">Selected by others</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>BOOKING SUMMARY</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Selected Seats:
                    </p>
                    <p className="font-semibold">
                      {selectedSeats.length > 0
                        ? seatStatuses
                            .filter((s) => selectedSeats.includes(s.seatId))
                            .map((s) => s.seat.seatCode)
                            .join(', ')
                        : 'None'}
                    </p>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passengers:</span>
                    <span className="font-semibold">{passengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Fare per seat:
                    </span>
                    <span className="font-semibold">
                      {formatPrice(trip.price)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">
                      {formatPrice(trip.price * selectedSeats.length)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee:</span>
                    <span className="font-semibold">{formatPrice(20000)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-bold text-2xl text-primary">
                      {formatPrice(trip.price * selectedSeats.length + 20000)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={selectedSeats.length !== passengers || isLocking}
                  onClick={
                    lockToken
                      ? () =>
                          navigate(
                            `/search/${id}/checkout?from=${from}&to=${to}&date=${date}&passengers=${passengers}&lock_token=${lockToken}&seat_ids=${selectedSeats.join(
                              ','
                            )}`
                          )
                      : handleContinueToCheckout
                  }
                >
                  {isLocking ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Locking Seats...
                    </>
                  ) : lockToken ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Continue to Checkout
                    </>
                  ) : (
                    'Lock Seats & Continue'
                  )}
                </Button>

                {selectedSeats.length !== passengers && !lockToken && (
                  <p className="text-sm text-center text-muted-foreground">
                    Please select {passengers - selectedSeats.length} more
                    seat(s)
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
