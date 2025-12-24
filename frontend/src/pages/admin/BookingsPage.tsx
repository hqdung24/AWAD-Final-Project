import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { getBookingDetail, getBookings, updateBookingStatus } from '@/services/bookingService';
import { notify } from '@/lib/notify';

export default function BookingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filters, setFilters] = useState<{
    email?: string;
    phone?: string;
    userId?: string;
    status?: string;
    from?: string;
    to?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-bookings', filters, page, pageSize],
    queryFn: () =>
      getBookings({
        email: filters.email || undefined,
        phone: filters.phone || undefined,
        userId: filters.userId || undefined,
        status: filters.status || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        page,
        limit: pageSize,
      }),
  });

  const bookingDetailQuery = useQuery({
    queryKey: ['booking-detail', selectedId],
    queryFn: () => getBookingDetail(selectedId!),
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    if (bookingDetailQuery.data?.status) {
      setStatusDraft(bookingDetailQuery.data.status);
    }
  }, [bookingDetailQuery.data?.status]);

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { id: string; status: 'pending' | 'paid' | 'cancelled' | 'expired' }) =>
      updateBookingStatus(payload.id, payload.status),
    onSuccess: () => {
      notify.success('Booking status updated');
      void qc.invalidateQueries({ queryKey: ['admin-bookings'] });
      void qc.invalidateQueries({ queryKey: ['booking-detail'] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to update status';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isForbidden = (error as any)?.status === 403;
    if (isForbidden) navigate('/403');
  }

  const bookings = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground text-sm">
          Review bookings, customers, and trip details.
        </p>
        {isLoading && (
          <p className="text-xs text-muted-foreground">Loading bookings…</p>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Booking List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-6">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Email
              <Input
                placeholder="Filter by email"
                value={filters.email ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, email: e.target.value || undefined }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Phone
              <Input
                placeholder="Filter by phone"
                value={filters.phone ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, phone: e.target.value || undefined }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              User ID
              <Input
                placeholder="Filter by user ID"
                value={filters.userId ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, userId: e.target.value || undefined }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Status
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={filters.status ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value || undefined }))
                }
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              From
              <Input
                type="date"
                value={filters.from ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, from: e.target.value || undefined }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              To
              <Input
                type="date"
                value={filters.to ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, to: e.target.value || undefined }))
                }
              />
            </label>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking, idx) => (
                  <TableRow
                    key={booking.id}
                    className={idx % 2 === 1 ? 'bg-muted/40' : undefined}
                  >
                    <TableCell>{booking.bookingReference ?? booking.id}</TableCell>
                    <TableCell>
                      {booking.trip?.origin} → {booking.trip?.destination}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.email}</div>
                    </TableCell>
                    <TableCell className="capitalize">{booking.status}</TableCell>
                    <TableCell>{booking.totalAmount.toLocaleString()} VND</TableCell>
                    <TableCell>{booking.createdAt.slice(0, 10)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedId(booking.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {selectedId && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Booking Details</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>
                  Close
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookingDetailQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading details…</p>
                ) : bookingDetailQuery.data ? (
                  <>
                    <div className="grid gap-2 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Reference</p>
                        <p className="font-medium">
                          {bookingDetailQuery.data.bookingReference ?? bookingDetailQuery.data.bookingId}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <div className="flex items-center gap-2">
                          <select
                            className="border-input bg-background text-sm px-2 py-1 rounded-md border"
                            value={statusDraft}
                            onChange={(e) => setStatusDraft(e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!selectedId) return;
                              updateStatusMutation.mutate({
                                id: selectedId,
                                status: statusDraft as 'pending' | 'paid' | 'cancelled' | 'expired',
                              });
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            Update
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="font-medium">
                          {bookingDetailQuery.data.totalAmount.toLocaleString()} VND
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trip</p>
                        <p className="font-medium">
                          {bookingDetailQuery.data.trip?.origin} → {bookingDetailQuery.data.trip?.destination}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {bookingDetailQuery.data.trip?.departureTime?.slice(0, 16).replace('T', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Customer</p>
                        <p className="font-medium">{bookingDetailQuery.data.name}</p>
                        <p className="text-sm text-muted-foreground">{bookingDetailQuery.data.email}</p>
                        <p className="text-sm text-muted-foreground">{bookingDetailQuery.data.phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Seats</p>
                      <div className="flex flex-wrap gap-2">
                        {bookingDetailQuery.data.seats.map((seat) => (
                          <span
                            key={seat.seatId}
                            className="text-xs rounded-full bg-muted px-2 py-1"
                          >
                            {seat.seatCode}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Passengers</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {bookingDetailQuery.data.passengers.map((passenger) => (
                          <div key={passenger.seatCode} className="rounded-md border p-2">
                            <p className="font-medium">{passenger.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              Seat {passenger.seatCode} · {passenger.documentId}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No details available.</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                className="border-input bg-background text-sm px-2 py-1 rounded-md border"
                value={pageSize}
                onChange={(e) => {
                  const next = Number(e.target.value) || 10;
                  setPageSize(next);
                  setPage(1);
                }}
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
