import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBooking } from '@/hooks/useBooking';
import type { BookingListItem } from '@/schemas/booking/booking.response';
import { type BookingListResponse } from '@/schemas/booking/booking.response';
import type {
  SeatChange,
  UpdateBookingRequest,
} from '@/services/bookingService';
import {
  getSeatStatusesByTrip,
  type SeatStatusItem,
} from '@/services/seatStatusService';
import { useUserStore } from '@/stores/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Clock, MapPin, Pencil, Ticket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { getSocket } from '@/lib/socket';

type BookingStatus = 'all' | 'pending' | 'paid' | 'expired' | 'cancelled';
type TripStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

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

const editBookingSchema = z.object({
  contact: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(7, 'Phone is required'),
  }),
  passengers: z
    .array(
      z.object({
        seatCode: z.string(),
        fullName: z.string().min(1, 'Full name is required'),
        documentId: z.string().min(3, 'Document ID is required'),
        seatId: z.string().optional(),
        newSeatId: z.string().optional(),
      })
    )
    .nonempty('At least one passenger'),
});

type EditBookingForm = z.infer<typeof editBookingSchema>;

function UserDashboard() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.me);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('all');
  const [selectedTripStatus, setSelectedTripStatus] = useState<
    TripStatus | 'all'
  >('all');
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const { bookingList, cancelBooking, updateBooking, changeSeats } = useBooking(
    user ? { userId: user.id } : undefined
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<BookingListItem | null>(
    null
  );
  const [seatStatuses, setSeatStatuses] = useState<SeatStatusItem[]>([]);
  const [seatLoading, setSeatLoading] = useState(false);
  const cutoffHours = 3;

  const form = useForm<EditBookingForm>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: {
      contact: {
        name: '',
        email: '',
        phone: '',
      },
      passengers: [],
    },
  });

  const passengersFieldArray = useFieldArray({
    control: form.control,
    name: 'passengers',
    keyName: 'key',
  });

  const statusFilters: { key: BookingStatus; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'paid', label: 'Paid' },
    { key: 'expired', label: 'Expired' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const tripStatusFilters: { key: string; label: string }[] = [
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  // Listen for realtime trip status updates
  useEffect(() => {
    const socket = getSocket(user?.id ?? undefined);
    socketRef.current = socket;

    const handleTripStatusUpdate = (data: unknown) => {
      // Validate event data
      const result = tripStatusUpdateEventSchema.safeParse(data);
      if (!result.success) {
        console.warn('Invalid trip status update event:', result.error);
        return;
      }

      const event = result.data;

      // Update the bookings list cache
      queryClient.setQueriesData<BookingListResponse>(
        { queryKey: ['bookings'] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((booking) =>
              booking.trip.id === event.tripId
                ? {
                    ...booking,
                    trip: {
                      ...booking.trip,
                      status: event.newStatus,
                    },
                  }
                : booking
            ),
          };
        }
      );

      queryClient.setQueriesData(
        { queryKey: ['booking'] },
        (oldData: unknown) => {
          const data = oldData as Record<string, unknown> | undefined;
          if (!data || typeof data.trip !== 'object' || !data.trip)
            return oldData;

          const trip = data.trip as Record<string, unknown>;
          if (trip.id === event.tripId) {
            return {
              ...data,
              trip: {
                ...trip,
                status: event.newStatus,
              },
            };
          }
          return oldData;
        }
      );
    };

    socket.on('trip:status.updated', handleTripStatusUpdate);

    return () => {
      socket.off('trip:status.updated', handleTripStatusUpdate);
    };
  }, [user?.id, queryClient]);

  const handleCancel = (id: string, status: BookingStatus) => {
    if (status !== 'pending') return;
    setPendingCancelId(id);
  };

  const openEditModal = async (booking: BookingListItem) => {
    if (booking.status === 'expired' || booking.status === 'cancelled') return;
    setEditingBookingId(booking.id);
    setEditingBooking(booking);
    form.reset({
      contact: {
        name: booking.name || '',
        email: booking.email || '',
        phone: booking.phone || '',
      },
      passengers: booking.passengers.map((p) => {
        const seat = booking.seats.find((s) => s.seatCode === p.seatCode);
        return {
          seatCode: p.seatCode,
          fullName: p.fullName || '',
          documentId: p.documentId || '',
          seatId: seat?.seatId,
          newSeatId: seat?.seatId,
        };
      }),
    });
    setSeatLoading(true);
    try {
      const seats = await getSeatStatusesByTrip(booking.trip.id);
      setSeatStatuses(seats);
    } catch {
      toast.error('Could not load seat availability');
    } finally {
      setSeatLoading(false);
      setEditDialogOpen(true);
    }
  };

  const handleEditSubmit = (values: EditBookingForm) => {
    if (!editingBookingId) return;
    const booking = editingBooking;
    if (!booking) return;

    const seatCodeById = new Map(
      booking.seats.map((s) => [s.seatId, s.seatCode])
    );
    seatStatuses.forEach((s) => {
      if (s.seatId && s.seatCode) {
        seatCodeById.set(s.seatId, s.seatCode);
      }
    });

    const seatChanges: SeatChange[] = [];

    const payload: UpdateBookingRequest = {
      name: values.contact.name,
      email: values.contact.email,
      phone: values.contact.phone,
      passengers: values.passengers.map((p) => {
        const targetSeatId = p.newSeatId || p.seatId;
        const targetSeatCode =
          (targetSeatId && seatCodeById.get(targetSeatId)) || p.seatCode;
        const currentSeatId = p.seatId;

        if (targetSeatId && currentSeatId && targetSeatId !== currentSeatId) {
          seatChanges.push({
            currentSeatId: currentSeatId,
            newSeatId: targetSeatId,
          });
        }

        return {
          seatCode: targetSeatCode,
          fullName: p.fullName,
          documentId: p.documentId,
        };
      }),
    };

    const runUpdate = async () => {
      if (seatChanges.length > 0) {
        await changeSeats.mutateAsync({
          id: editingBookingId,
          seatChanges,
        });
      }
      await updateBooking.mutateAsync({ id: editingBookingId, payload });
    };

    runUpdate()
      .then(() => {
        setEditDialogOpen(false);
        setEditingBookingId(null);
        setEditingBooking(null);
      })
      .catch(() => {
        // errors handled via mutations' onError
      })
      .finally(() => {
        form.reset();
      });
  };

  const canEditBooking = (b: BookingListItem) => {
    if (
      b.status === 'expired' ||
      b.status === 'cancelled' ||
      b.status === 'paid'
    )
      return false;
    const dep = new Date(b.trip.departureTime).getTime();
    return dep - Date.now() > cutoffHours * 60 * 60 * 1000;
  };

  const upcomingTrips = (bookingList.data?.data ?? [])
    .filter((b) => {
      // Filter by booking status
      if (selectedStatus !== 'all' && b.status !== selectedStatus) {
        return false;
      }
      // Filter by trip status (completed/archived)
      if (
        selectedTripStatus !== 'all' &&
        b.trip.status !== selectedTripStatus
      ) {
        return false;
      }
      return true;
    })
    .map((b) => ({
      booking: b,
      route: `${b.trip.origin} → ${b.trip.destination}`,
      datetime: new Date(b.trip.departureTime).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }),
      seats: b.passengers.map((s) => s.seatCode).join(', '),
      bookingId: b.id,
      bookingRef: b.bookingReference || b.id,
      status: b.status as BookingStatus,
      tripStatus: b.trip.status,
      canEdit: canEditBooking(b),
    }));

  const paidBooking = upcomingTrips.filter((b) => b.status === 'paid').length;

  const notifications = [
    {
      type: 'upcoming' as const,
      message:
        bookingList.data?.total && bookingList.data?.total > 0
          ? `You have ${paidBooking} upcoming booking(s)`
          : 'No upcoming trips yet',
    },
    {
      type: 'alert' as const,
      message: 'Get alerts for departure changes',
    },
  ];

  const statusBadgeClass: Record<BookingStatus, string> = {
    all: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]',
    pending:
      'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/40',
    paid: 'bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/40',
    expired:
      'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/40',
    cancelled:
      'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/40',
  };

  return (
    <>
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
                    <CardTitle className="text-lg font-semibold inline-flex items-center gap-3">
                      <span>{trip.route}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            trip.tripStatus.toLowerCase() === 'scheduled'
                              ? 'bg-blue-500'
                              : trip.tripStatus.toLowerCase() === 'cancelled'
                              ? 'bg-red-500'
                              : trip.tripStatus.toLowerCase() === 'completed'
                              ? 'bg-gray-500'
                              : 'bg-green-500'
                          }`}
                        />
                        {trip.tripStatus}
                      </span>
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
                      Booking ref: {trip.bookingRef}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={statusBadgeClass[trip.status]}>
                        {trip.status}
                      </Badge>
                      {trip.canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(trip.booking)}
                          aria-label="Edit booking"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  {trip.status === 'pending' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/payment/${trip.bookingId}`)}
                    >
                      Pay Now
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate(`/upcoming-trip/${trip.bookingId}`)}
                  >
                    {trip.status === 'paid' ? 'View E-ticket' : 'View details'}
                  </Button>
                  {/* Cancel button only enabled for pending bookings */}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={trip.status !== 'pending'}
                    onClick={() => handleCancel(trip.bookingId, trip.status)}
                    className="text-red-500 border-red-500 dark:border-red-500 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    {cancelBooking.isPending &&
                    trip.bookingId === cancelBooking.variables
                      ? 'Cancelling…'
                      : 'Cancel'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle>Filter Bookings</CardTitle>
              <div className="rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
                {notifications.find((n) => n.type === 'upcoming')?.message ??
                  'Stay updated on your trips'}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* All filter button */}
              <button
                onClick={() => setSelectedStatus('all')}
                className={`flex items-center justify-between w-full rounded-lg px-3 py-2 font-medium transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-muted/60 text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                All
                {selectedStatus === 'all' && <Badge variant="default">●</Badge>}
              </button>

              {/* Booking status filter buttons */}
              {statusFilters.map((status) => (
                <button
                  key={status.key}
                  onClick={() => setSelectedStatus(status.key)}
                  className={`flex items-center justify-between w-full rounded-lg px-3 py-2 font-medium transition-colors ${
                    selectedStatus === status.key
                      ? 'bg-muted/60 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  {status.label}
                  {selectedStatus === status.key && (
                    <Badge variant="default">●</Badge>
                  )}
                </button>
              ))}

              {/* Trip status filters */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2 px-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Trip Status
                  </p>
                  {selectedTripStatus !== 'all' && (
                    <button
                      onClick={() => setSelectedTripStatus('all')}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedTripStatus('all')}
                  className={`flex items-center justify-between w-full rounded-lg px-3 py-2 font-medium transition-colors mb-1 ${
                    selectedTripStatus === 'all'
                      ? 'bg-muted/60 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  All
                  {selectedTripStatus === 'all' && (
                    <Badge variant="default">●</Badge>
                  )}
                </button>
                {tripStatusFilters.map((status) => (
                  <button
                    key={status.key}
                    onClick={() =>
                      setSelectedTripStatus(status.key as TripStatus)
                    }
                    className={`flex items-center justify-between w-full rounded-lg px-3 py-2 font-medium transition-colors ${
                      selectedTripStatus === status.key
                        ? 'bg-muted/60 text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    {status.label}
                    {selectedTripStatus === status.key && (
                      <Badge variant="default">●</Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={editDialogOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            form.reset();
            setEditDialogOpen(false);
            setEditingBookingId(null);
            setEditingBooking(null);
            setSeatStatuses([]);
          }
        }}
      >
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit booking details</AlertDialogTitle>
            <AlertDialogDescription>
              Update contact info and passenger details for this pending
              booking.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleEditSubmit)}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="contact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact phone</FormLabel>
                      <FormControl>
                        <Input placeholder="0xxxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Passenger details</p>
                {passengersFieldArray.fields.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No passenger data available to edit.
                  </p>
                )}
                {passengersFieldArray.fields.map((field, idx) => (
                  <div
                    key={field.key}
                    className="rounded-lg border border-border/70 p-3 space-y-2"
                  >
                    <p className="text-xs font-semibold text-muted-foreground">
                      Seat {field.seatCode}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`passengers.${idx}.fullName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                              <Input placeholder="Passenger name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`passengers.${idx}.documentId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document ID</FormLabel>
                            <FormControl>
                              <Input placeholder="ID / Passport" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`passengers.${idx}.newSeatId`}
                        render={({ field }) => {
                          const currentSeatId =
                            form.watch(`passengers.${idx}.seatId`) || '';
                          const options = seatStatuses.filter(
                            (s) =>
                              s.state === 'available' ||
                              s.seatId === currentSeatId
                          );
                          return (
                            <FormItem>
                              <FormLabel>Seat</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(val) => field.onChange(val)}
                                disabled={seatLoading || changeSeats.isPending}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose seat" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {options.map((opt) => (
                                    <SelectItem
                                      key={opt.seatId}
                                      value={opt.seatId}
                                    >
                                      {opt.seatCode || opt.seatId}{' '}
                                      {opt.state !== 'available'
                                        ? '(current)'
                                        : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <AlertDialogFooter className="gap-2 sm:justify-end">
                <AlertDialogCancel
                  type="button"
                  onClick={() => {
                    form.reset();
                    setEditDialogOpen(false);
                    setEditingBookingId(null);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={updateBooking.isPending}
                >
                  {updateBooking.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!pendingCancelId}
        onOpenChange={(open: boolean) => {
          if (!open) setPendingCancelId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? This action cannot be undone and
              your seats will be released.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelBooking.isPending}>
              Keep booking
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-600"
              disabled={cancelBooking.isPending}
              onClick={() => {
                if (!pendingCancelId) return;
                cancelBooking.mutate(pendingCancelId, {
                  onSettled: () => setPendingCancelId(null),
                });
              }}
            >
              {cancelBooking.isPending ? 'Cancelling…' : 'Yes, cancel booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default UserDashboard;
