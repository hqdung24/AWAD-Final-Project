import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { listTrips } from '@/services/tripService';
import { checkInPassenger, listTripPassengers, resetPassengerCheckIn } from '@/services/passengerService';
import { notify } from '@/lib/notify';
import { listOperators } from '@/services/operatorService';
import { listAdminRoutes } from '@/services/adminRoutesService';

export default function PassengersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tripId, setTripId] = useState<string>('');
  const [tripFilter, setTripFilter] = useState('');
  const [tripStatusFilter, setTripStatusFilter] = useState<string>('');
  const [operatorFilter, setOperatorFilter] = useState('');
  const [routeFilter, setRouteFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [passengerFilter, setPassengerFilter] = useState('');

  const tripsQuery = useQuery({
    queryKey: ['admin-trip-options', tripStatusFilter, routeFilter],
    queryFn: () =>
      listTrips({
        page: 1,
        limit: 200,
        status: tripStatusFilter || undefined,
        routeId: routeFilter || undefined,
      }),
  });

  const operatorsQuery = useQuery({
    queryKey: ['operators'],
    queryFn: listOperators,
  });

  const routesQuery = useQuery({
    queryKey: ['admin-routes'],
    queryFn: () => listAdminRoutes({ isActive: true }),
  });

  const passengersQuery = useQuery({
    queryKey: ['trip-passengers', tripId],
    queryFn: () => listTripPassengers(tripId),
    enabled: Boolean(tripId),
  });

  const checkInMutation = useMutation({
    mutationFn: (payload: { passengerId: string }) =>
      checkInPassenger(tripId, payload.passengerId),
    onSuccess: () => {
      notify.success('Passenger checked in');
      void qc.invalidateQueries({ queryKey: ['trip-passengers', tripId] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to check in';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const resetMutation = useMutation({
    mutationFn: (payload: { passengerId: string }) =>
      resetPassengerCheckIn(tripId, payload.passengerId),
    onSuccess: () => {
      notify.success('Check-in reset');
      void qc.invalidateQueries({ queryKey: ['trip-passengers', tripId] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to reset check-in';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  if (tripsQuery.error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isForbidden = (tripsQuery.error as any)?.status === 403;
    if (isForbidden) navigate('/403');
  }

  const trips = tripsQuery.data?.data ?? [];
  const filteredTrips = useMemo(() => {
    let result = trips;

    if (operatorFilter) {
      result = result.filter((trip) => trip.bus?.operatorId === operatorFilter);
    }

    if (routeFilter) {
      result = result.filter((trip) => trip.routeId === routeFilter);
    }

    if (fromFilter) {
      const fromDate = new Date(`${fromFilter}T00:00:00`);
      result = result.filter((trip) => new Date(trip.departureTime) >= fromDate);
    }

    if (toFilter) {
      const toDate = new Date(`${toFilter}T23:59:59`);
      result = result.filter((trip) => new Date(trip.departureTime) <= toDate);
    }

    if (tripFilter) {
      const q = tripFilter.toLowerCase();
      result = result.filter((trip) => {
        const route = `${trip.route?.origin ?? ''} ${trip.route?.destination ?? ''}`.toLowerCase();
        const dateText = trip.departureTime
          ? new Date(trip.departureTime).toLocaleString().toLowerCase()
          : '';
        return route.includes(q) || dateText.includes(q) || trip.id.toLowerCase().includes(q);
      });
    }

    return result;
  }, [trips, tripFilter, operatorFilter, routeFilter, fromFilter, toFilter]);

  const filteredPassengers = useMemo(() => {
    const passengers = passengersQuery.data ?? [];
    if (!passengerFilter) return passengers;
    const q = passengerFilter.toLowerCase();
    return passengers.filter((p) => {
      const contact = `${p.booking?.name ?? ''} ${p.booking?.email ?? ''}`.toLowerCase();
      const seat = p.seatCode?.toLowerCase() ?? '';
      const doc = p.documentId?.toLowerCase() ?? '';
      const name = p.fullName?.toLowerCase() ?? '';
      return (
        name.includes(q) ||
        seat.includes(q) ||
        doc.includes(q) ||
        contact.includes(q)
      );
    });
  }, [passengersQuery.data, passengerFilter]);

  const selectedTrip = trips.find((trip) => trip.id === tripId);
  const checkedInCount = filteredPassengers.filter((p) => p.checkedInAt).length;
  const pendingCount = filteredPassengers.length - checkedInCount;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight">Passengers</h1>
        <p className="text-muted-foreground text-sm">
          View passengers by trip and mark check-ins.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Trip Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 md:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Operator
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={operatorFilter}
                onChange={(e) => setOperatorFilter(e.target.value)}
              >
                <option value="">All operators</option>
                {(operatorsQuery.data ?? []).map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Route
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
              >
                <option value="">All routes</option>
                {(routesQuery.data ?? []).map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.origin} → {route.destination}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Trip status
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={tripStatusFilter}
                onChange={(e) => setTripStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </label>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              From
              <Input
                type="date"
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              To
              <Input
                type="date"
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Filter trips
              <Input
                placeholder="Search by route or date"
                value={tripFilter}
                onChange={(e) => setTripFilter(e.target.value)}
              />
            </label>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOperatorFilter('');
                setRouteFilter('');
                setTripStatusFilter('');
                setFromFilter('');
                setToFilter('');
                setTripFilter('');
                setTripId('');
              }}
            >
              Reset filters
            </Button>
          </div>
          <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
            Trip
            <select
              className="border-input bg-background text-sm px-3 py-2 rounded-md border"
              value={tripId}
              onChange={(e) => setTripId(e.target.value)}
            >
              <option value="">Select a trip</option>
              {filteredTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.route?.origin ?? 'Origin'} → {trip.route?.destination ?? 'Destination'} ·{' '}
                  {new Date(trip.departureTime).toLocaleString()}
                </option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Passenger List</span>
            {tripId && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{filteredPassengers.length} passengers</Badge>
                <Badge variant="outline">{checkedInCount} checked in</Badge>
                <Badge variant="outline">{pendingCount} pending</Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTrip && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">
                {selectedTrip.route?.origin ?? 'Origin'} →{' '}
                {selectedTrip.route?.destination ?? 'Destination'}
              </Badge>
              <Badge variant="outline">
                {new Date(selectedTrip.departureTime).toLocaleString()}
              </Badge>
              <Badge variant="outline">{selectedTrip.status ?? 'scheduled'}</Badge>
            </div>
          )}
          <Separator className={selectedTrip ? 'mb-3' : 'mb-4'} />
          <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1 mb-3">
            Filter passengers
            <Input
              placeholder="Search by name, seat, document, or email"
              value={passengerFilter}
              onChange={(e) => setPassengerFilter(e.target.value)}
            />
          </label>
          {passengersQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading passengers…</p>
          ) : tripId ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seat</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPassengers.map((passenger, idx) => (
                    <TableRow
                      key={passenger.id}
                      className={idx % 2 === 1 ? 'bg-muted/40' : undefined}
                    >
                      <TableCell>{passenger.seatCode}</TableCell>
                      <TableCell className="font-medium">{passenger.fullName}</TableCell>
                      <TableCell>{passenger.documentId}</TableCell>
                      <TableCell>
                        <div className="text-sm">{passenger.booking?.name ?? '—'}</div>
                        <div className="text-xs text-muted-foreground">
                          {passenger.booking?.email ?? '—'}
                        </div>
                      </TableCell>
                      <TableCell>{passenger.booking?.bookingReference ?? '—'}</TableCell>
                      <TableCell>
                        {passenger.checkedInAt ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            Checked in ·{' '}
                            {new Date(passenger.checkedInAt).toLocaleTimeString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not checked in</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {passenger.checkedInAt ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resetMutation.mutate({ passengerId: passenger.id })}
                            disabled={resetMutation.isPending}
                          >
                            Reset
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => checkInMutation.mutate({ passengerId: passenger.id })}
                            disabled={checkInMutation.isPending}
                          >
                            Check-in
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPassengers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No passengers found for this trip.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a trip to view passengers.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
