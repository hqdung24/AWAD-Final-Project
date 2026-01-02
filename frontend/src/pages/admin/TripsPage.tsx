import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  listAdminRoutes,
  type AdminRoute,
} from '@/services/adminRoutesService';
import {
  listTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  listBuses,
  type TripListResponse,
  type Trip,
  type Bus,
} from '@/services/tripService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notify } from '@/lib/notify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const initialTripForm: Partial<Trip> = {
  routeId: '',
  busId: '',
  departureTime: '',
  arrivalTime: '',
  basePrice: 0,
  status: 'scheduled',
};

export default function TripsPage() {
  const qc = useQueryClient();
  const [tripForm, setTripForm] = useState<Partial<Trip>>(initialTripForm);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [tripModalOpen, setTripModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{
    routeId?: string;
    busId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>({});

  const { data: adminRoutes = [] } = useQuery<AdminRoute[]>({
    queryKey: ['admin-routes'],
    queryFn: () => listAdminRoutes({ isActive: undefined }),
  });
  const isDerivedStatusFilter =
    filters.status === 'in_progress' || filters.status === 'completed';
  const backendStatus =
    filters.status === 'in_progress'
      ? undefined
      : filters.status === 'completed'
      ? undefined
      : filters.status;
  const effectivePage = isDerivedStatusFilter ? 1 : page;
  const effectiveLimit = isDerivedStatusFilter ? 2000 : pageSize;

  const { data: tripsResponse } = useQuery<TripListResponse>({
    queryKey: ['trips', effectivePage, effectiveLimit, filters, backendStatus],
    queryFn: () =>
      listTrips({
        page: effectivePage,
        limit: effectiveLimit,
        routeId: filters.routeId,
        busId: filters.busId,
        status: backendStatus,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }),
  });
  const { data: buses = [] } = useQuery<Bus[]>({
    queryKey: ['buses'],
    queryFn: () => listBuses({ isActive: true }),
  });
  const trips = tripsResponse?.data ?? [];
  const scheduledCount = trips.filter((trip) => trip.status === 'scheduled').length;

  const getDisplayStatusKey = (trip: Trip) => {
    if (trip.status === 'cancelled') return 'cancelled';
    const now = new Date();
    const departure = new Date(trip.departureTime);
    const arrival = new Date(trip.arrivalTime);
    if (now >= departure && now <= arrival) {
      if (trip.status === 'scheduled' || trip.status === 'completed') {
        return 'in_progress';
      }
    }
    if (trip.status === 'completed' || trip.status === 'archived') return 'completed';
    if (trip.status === 'scheduled') return 'scheduled';
    return trip.status;
  };

  const getDisplayStatusLabel = (trip: Trip) => {
    const key = getDisplayStatusKey(trip);
    if (key === 'in_progress') return 'In Progress';
    if (key === 'completed') return 'Completed';
    if (key === 'cancelled') return 'Cancelled';
    return 'Scheduled';
  };

  const filteredTrips = filters.status
    ? trips.filter((trip) => getDisplayStatusKey(trip) === filters.status)
    : trips;
  const total = isDerivedStatusFilter ? filteredTrips.length : tripsResponse?.total ?? 0;
  const totalPages =
    pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const visibleTrips = isDerivedStatusFilter
    ? filteredTrips.slice((page - 1) * pageSize, page * pageSize)
    : filteredTrips;

  const tripCreateMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      setTripForm(initialTripForm);
      setEditingTripId(null);
      setTripModalOpen(false);
      void qc.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create trip';
      const text = Array.isArray(message) ? message.join(', ') : message;
      notify.error(`Cannot create trip: ${text}`);
    },
  });

  const tripUpdateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Omit<Trip, 'id'>> }) =>
      updateTrip(payload.id, payload.data),
    onSuccess: () => {
      setEditingTripId(null);
      setTripModalOpen(false);
      void qc.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update trip';
      const text = Array.isArray(message) ? message.join(', ') : message;
      notify.error(`Cannot update trip: ${text}`);
    },
  });

  const tripDeleteMutation = useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const handleSubmit = () => {
    if (!tripForm.routeId || !tripForm.busId || !tripForm.departureTime || !tripForm.arrivalTime) {
      return;
    }
    const basePrice = Number.isFinite(Number(tripForm.basePrice))
      ? Number(tripForm.basePrice)
      : 0;

    if (editingTripId) {
      tripUpdateMutation.mutate({
        id: editingTripId,
        data: {
          routeId: tripForm.routeId,
          busId: tripForm.busId,
          departureTime: tripForm.departureTime,
          arrivalTime: tripForm.arrivalTime,
          basePrice,
          status: tripForm.status,
        },
      });
    } else {
      tripCreateMutation.mutate({
        routeId: tripForm.routeId,
        busId: tripForm.busId,
        departureTime: tripForm.departureTime,
        arrivalTime: tripForm.arrivalTime,
        basePrice,
      });
    }
  };

  const openCreateTrip = () => {
    setEditingTripId(null);
    setTripForm(initialTripForm);
    setTripModalOpen(true);
  };

  const openEditTrip = (trip: Trip) => {
    setEditingTripId(trip.id);
    setTripForm({
      routeId: trip.routeId,
      busId: trip.busId,
      departureTime: trip.departureTime.slice(0, 16),
      arrivalTime: trip.arrivalTime.slice(0, 16),
      status: trip.status === 'archived' ? 'completed' : trip.status,
      basePrice: Number(trip.basePrice),
    });
    setTripModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
        <p className="text-muted-foreground text-sm">
          Manage scheduled trips, buses, and routes.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trip Scheduling</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">
                Assign buses, set times, and manage trips
              </span>
              <Button size="sm" onClick={openCreateTrip}>
                New trip
              </Button>
            </div>
          </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{total} trips</Badge>
            <Badge variant="outline">{scheduledCount} scheduled</Badge>
          </div>

          <Separator />

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Filters</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setPage(1);
                }}
              >
                Reset filters
              </Button>
            </div>
            <div className="grid gap-2 md:grid-cols-6">
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Route
                <select
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  value={filters.routeId ?? ''}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, routeId: e.target.value || undefined }));
                    setPage(1);
                  }}
                >
                  <option value="">All routes</option>
                  {adminRoutes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.origin} → {r.destination}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Bus
                <select
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  value={filters.busId ?? ''}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, busId: e.target.value || undefined }));
                    setPage(1);
                  }}
                >
                  <option value="">All buses</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.operator?.name ? `${b.operator.name} — ` : ''}
                      {b.plateNumber} · {b.model} ({b.seatCapacity})
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Sort by
                <select
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  value={filters.sortBy ?? ''}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value || undefined,
                    }));
                    setPage(1);
                  }}
                >
                  <option value="">Departure time</option>
                  <option value="arrivalTime">Arrival time</option>
                  <option value="basePrice">Base price</option>
                  <option value="bookings">Bookings</option>
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Order
                <select
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  value={filters.sortOrder ?? 'desc'}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      sortOrder: (e.target.value as 'asc' | 'desc') || 'desc',
                    }));
                    setPage(1);
                  }}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Status
                <select
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  value={filters.status ?? ''}
                  onChange={(e) => {
                    setFilters((prev) => ({ ...prev, status: e.target.value || undefined }));
                    setPage(1);
                  }}
                >
                  <option value="">All</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTrips.map((trip, idx) => {
                  const route = adminRoutes.find((r) => r.id === trip.routeId);
                  const bus = buses.find((b) => b.id === trip.busId);
                  return (
                    <TableRow
                      key={trip.id}
                      className={idx % 2 === 1 ? 'bg-muted/40' : undefined}
                    >
                      <TableCell>
                        {route ? `${route.origin} → ${route.destination}` : trip.routeId}
                      </TableCell>
                      <TableCell>
                        {bus
                          ? `${bus.operator?.name ?? 'Operator'} — ${bus.model} (${bus.seatCapacity})`
                          : trip.busId}
                      </TableCell>
                      <TableCell>{new Date(trip.departureTime).toLocaleString()}</TableCell>
                      <TableCell>{new Date(trip.arrivalTime).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{getDisplayStatusLabel(trip) ?? '—'}</span>
                          <span className="text-xs text-muted-foreground">
                            {trip.basePrice.toLocaleString()} VND
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                        onClick={() => openEditTrip(trip)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => tripDeleteMutation.mutate(trip.id)}
                          disabled={tripDeleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {visibleTrips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No trips found. Adjust filters or create a new trip.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                className="border-input bg-background text-sm px-2 py-1 rounded-md border"
                value={pageSize}
                onChange={(e) => {
                  const nextSize = Number(e.target.value) || 10;
                  setPageSize(nextSize);
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
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={tripModalOpen}
        onOpenChange={(open) => {
          setTripModalOpen(open);
          if (!open) {
            setEditingTripId(null);
            setTripForm(initialTripForm);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingTripId ? 'Edit trip' : 'Create trip'}</DialogTitle>
            <DialogDescription>
              Set the route, bus, and time window. Trips appear in search once scheduled.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Route
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={tripForm.routeId ?? ''}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, routeId: e.target.value }))
                }
              >
                <option value="">Select route</option>
                {adminRoutes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.origin} → {r.destination}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Bus
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={tripForm.busId ?? ''}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, busId: e.target.value }))
                }
              >
                <option value="">Select bus</option>
                {buses.map((b) => {
                  const seatCount = b.seatCount ?? 0;
                  return (
                    <option key={b.id} value={b.id} disabled={seatCount === 0}>
                      {b.operator?.name ? `${b.operator.name} — ` : ''}
                      {b.plateNumber} · {b.model} ({seatCount}/{b.seatCapacity})
                      {seatCount === 0 ? ' · no seats' : ''}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Departure
              <Input
                type="datetime-local"
                value={tripForm.departureTime ?? ''}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, departureTime: e.target.value }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Arrival
              <Input
                type="datetime-local"
                value={tripForm.arrivalTime ?? ''}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, arrivalTime: e.target.value }))
                }
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Status
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={tripForm.status ?? ''}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Base price (VND)
              <Input
                value={tripForm.basePrice ?? 0}
                type="number"
                min={0}
                onChange={(e) =>
                  setTripForm((prev) => ({
                    ...prev,
                    basePrice: Number.isFinite(Number(e.target.value))
                      ? Number(e.target.value)
                      : 0,
                  }))
                }
                placeholder="450000"
              />
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTripModalOpen(false)}
              disabled={tripCreateMutation.isPending || tripUpdateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                tripCreateMutation.isPending ||
                tripUpdateMutation.isPending ||
                !tripForm.routeId ||
                !tripForm.busId ||
                !tripForm.departureTime ||
                !tripForm.arrivalTime
              }
            >
              {editingTripId
                ? tripUpdateMutation.isPending
                  ? 'Saving…'
                  : 'Update Trip'
                : tripCreateMutation.isPending
                ? 'Saving…'
                : 'Create Trip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
