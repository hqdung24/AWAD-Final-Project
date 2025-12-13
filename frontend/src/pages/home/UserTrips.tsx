import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
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
import { useBooking } from '@/hooks/useBooking';
import { useUserStore } from '@/stores/user';
import type { BookingListItem } from '@/schemas/booking/booking.response';
import type { UpdateBookingRequest } from '@/services/bookingService';
import { ArrowRight, Clock, MapPin, Pencil, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type BookingStatus = 'all' | 'pending' | 'paid' | 'expired' | 'cancelled';

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
      })
    )
    .nonempty('At least one passenger'),
});

type EditBookingForm = z.infer<typeof editBookingSchema>;

function UserDashboard() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.me);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>('all');
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);
  const { bookingList, cancelBooking, updateBooking } = useBooking(
    user ? { userId: user.id } : undefined
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);

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

  const handleCancel = (id: string, status: BookingStatus) => {
    if (status !== 'pending') return;
    setPendingCancelId(id);
  };

  const openEditModal = (booking: BookingListItem) => {
    if (booking.status !== 'pending') return;
    setEditingBookingId(booking.id);
    form.reset({
      contact: {
        name: booking.name || '',
        email: booking.email || '',
        phone: booking.phone || '',
      },
      passengers: booking.passengers.map((p) => ({
        seatCode: p.seatCode,
        fullName: p.fullName || '',
        documentId: p.documentId || '',
      })),
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (values: EditBookingForm) => {
    if (!editingBookingId) return;
    const payload: UpdateBookingRequest = {
      name: values.contact.name,
      email: values.contact.email,
      phone: values.contact.phone,
      passengers: values.passengers.map((p) => ({
        seatCode: p.seatCode,
        fullName: p.fullName,
        documentId: p.documentId,
      })),
    };

    updateBooking.mutate(
      { id: editingBookingId, payload },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setEditingBookingId(null);
        },
        onSettled: () => {
          form.reset();
        },
      }
    );
  };

  const upcomingTrips = (bookingList.data?.data ?? [])
    .filter((b) => {
      if (selectedStatus === 'all') return true;
      return b.status === selectedStatus;
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
      seats: b.seats.map((s) => s.seatCode).join(', '),
      bookingId: b.id,
      bookingRef: b.bookingReference || b.id,
      status: b.status as BookingStatus,
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
      'bg-[hsl(var(--info))]/18  text-[hsl(var(--muted-foreground))]   border border-[hsl(var(--info))]/40',
    paid: 'bg-[hsl(var(--primary))]/18 text-[hsl(var(--muted-foreground))]  border border-[hsl(var(--primary))]/40',
    expired:
      'bg-[hsl(var(--warning))]/15 border text-[hsl(var(--muted-foreground))]  border-[hsl(var(--warning))]/40',
    cancelled:
      'bg-[hsl(var(--destructive))]/15 text-[hsl(var(--muted-foreground))]  border border-[hsl(var(--destructive))]/40',
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
                      Booking ref: {trip.bookingRef}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusBadgeClass[trip.status]}>
                      {trip.status}
                    </Badge>
                    {trip.status === 'pending' && (
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

              {/* Status filter buttons */}
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
