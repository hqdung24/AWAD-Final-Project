import { useState } from 'react';
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
    queryFn: listAdminRoutes,
  });
  const { data: tripsResponse } = useQuery<TripListResponse>({
    queryKey: ['trips', page, pageSize, filters],
    queryFn: () =>
      listTrips({
        page,
        limit: pageSize,
        routeId: filters.routeId,
        busId: filters.busId,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }),
  });
  const { data: buses = [] } = useQuery<Bus[]>({
    queryKey: ['buses'],
    queryFn: listBuses,
  });
  const trips = tripsResponse?.data ?? [];
  const total = tripsResponse?.total ?? 0;
  const totalPages =
    tripsResponse?.totalPages ??
    (pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1);

  const tripCreateMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      setTripForm(initialTripForm);
      setEditingTripId(null);
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
            <span className="text-muted-foreground text-xs">
              Assign buses, set times, and manage trips
            </span>
          </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  {['scheduled', 'cancelled', 'completed', 'archived'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Create/update form */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>Trip form</span>
            {editingTripId && <span>Editing trip: {editingTripId}</span>}
          </div>
          <div className="grid gap-2 md:grid-cols-4">
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
              <input
                type="datetime-local"
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={tripForm.departureTime ?? ''}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, departureTime: e.target.value }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Arrival
              <input
                type="datetime-local"
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={tripForm.arrivalTime ?? ''}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, arrivalTime: e.target.value }))
                }
              />
            </label>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Status
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={tripForm.status ?? ''}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                {['scheduled', 'cancelled', 'completed', 'archived'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Base price (VND)
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
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
            <div className="flex items-end gap-2">
              <Button
                size="sm"
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setTripForm(initialTripForm);
                  setEditingTripId(null);
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
                  <TableHead>Route</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip, idx) => {
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
                          <span>{trip.status ?? '—'}</span>
                          <span className="text-xs text-muted-foreground">
                            {trip.basePrice.toLocaleString()} VND
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                        onClick={() => {
                          setEditingTripId(trip.id);
                          setTripForm({
                            routeId: trip.routeId,
                            busId: trip.busId,
                            departureTime: trip.departureTime.slice(0, 16),
                            arrivalTime: trip.arrivalTime.slice(0, 16),
                            status: trip.status,
                            basePrice: Number(trip.basePrice),
                          });
                        }}
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
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  const nextSize = Number(val) || 10;
                  setPageSize(nextSize);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[90px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    </div>
  );
}
