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

  const { data: adminRoutes = [] } = useQuery<AdminRoute[]>({
    queryKey: ['admin-routes'],
    queryFn: listAdminRoutes,
  });
  const { data: tripsResponse } = useQuery<TripListResponse>({
    queryKey: ['trips'],
    queryFn: listTrips,
  });
  const { data: buses = [] } = useQuery<Bus[]>({
    queryKey: ['buses'],
    queryFn: listBuses,
  });
  const trips = tripsResponse?.data ?? [];

  const tripCreateMutation = useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      setTripForm(initialTripForm);
      setEditingTripId(null);
      void qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const tripUpdateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Omit<Trip, 'id'>> }) =>
      updateTrip(payload.id, payload.data),
    onSuccess: () => {
      setEditingTripId(null);
      void qc.invalidateQueries({ queryKey: ['trips'] });
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
    if (editingTripId) {
      tripUpdateMutation.mutate({
        id: editingTripId,
        data: {
          routeId: tripForm.routeId,
          busId: tripForm.busId,
          departureTime: tripForm.departureTime,
          arrivalTime: tripForm.arrivalTime,
          basePrice: tripForm.basePrice,
          status: tripForm.status,
        },
      });
    } else {
      tripCreateMutation.mutate({
        routeId: tripForm.routeId,
        busId: tripForm.busId,
        departureTime: tripForm.departureTime,
        arrivalTime: tripForm.arrivalTime,
        basePrice: tripForm.basePrice ?? 0,
        status: tripForm.status,
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
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
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.operator?.name ? `${b.operator.name} — ` : ''}
                    {b.plateNumber} · {b.model} ({b.seatCapacity})
                  </option>
                ))}
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
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={tripForm.status ?? ''}
                onChange={(e) =>
                  setTripForm((prev) => ({ ...prev, status: e.target.value }))
                }
                placeholder="scheduled"
              />
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
                {trips.map((trip) => {
                  const route = adminRoutes.find((r) => r.id === trip.routeId);
                  const bus = buses.find((b) => b.id === trip.busId);
                  return (
                    <TableRow key={trip.id}>
                      <TableCell>
                        {route ? `${route.origin} → ${route.destination}` : trip.routeId}
                      </TableCell>
                      <TableCell>{bus ? `${bus.name} (${bus.capacity})` : trip.busId}</TableCell>
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
                            basePrice: trip.basePrice,
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
        </CardContent>
      </Card>
    </div>
  );
}
