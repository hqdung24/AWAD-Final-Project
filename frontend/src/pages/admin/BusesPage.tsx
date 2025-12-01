import { useEffect, useState } from 'react';
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
  listBuses,
  createBus,
  updateBus,
  deleteBus,
  listAssignments,
  assignBus,
  deleteAssignment,
  type Bus,
  type BusAssignment,
  type Seat,
  getSeatMap,
  updateSeatMap,
} from '@/services/busService';
import { listAdminRoutes, type AdminRoute } from '@/services/adminRoutesService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const initialBus: Omit<Bus, 'id'> = {
  operatorId: '',
  name: '',
  plateNumber: '',
  model: '',
  seatCapacity: 40,
  seatMetaJson: '',
};

export default function BusesPage() {
  const qc = useQueryClient();
  const [busForm, setBusForm] = useState<Omit<Bus, 'id'>>(initialBus);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState<{
    busId: string;
    routeId: string;
    startTime: string;
    endTime: string;
  }>({ busId: '', routeId: '', startTime: '', endTime: '' });
  const [seatBusId, setSeatBusId] = useState<string>('');
  const [seats, setSeats] = useState<Seat[]>([]);

  const { data: buses = [] } = useQuery<Bus[]>({
    queryKey: ['buses'],
    queryFn: listBuses,
  });
  const { data: routes = [] } = useQuery<AdminRoute[]>({
    queryKey: ['admin-routes'],
    queryFn: listAdminRoutes,
  });
  const { data: assignments = [] } = useQuery<BusAssignment[]>({
    queryKey: ['bus-assignments'],
    queryFn: () => listAssignments(),
  });

  const { data: seatData, refetch: refetchSeatMap } = useQuery<Seat[]>({
    queryKey: ['seat-map', seatBusId],
    queryFn: () => getSeatMap(seatBusId),
    enabled: Boolean(seatBusId),
    onSuccess: (data) => setSeats(data),
  });

  useEffect(() => {
    if (!seatBusId) setSeats([]);
  }, [seatBusId]);

  const createBusMutation = useMutation({
    mutationFn: createBus,
    onSuccess: () => {
      setBusForm(initialBus);
      setEditingBusId(null);
      void qc.invalidateQueries({ queryKey: ['buses'] });
    },
  });

  const updateBusMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Omit<Bus, 'id'>> }) =>
      updateBus(payload.id, payload.data),
    onSuccess: () => {
      setEditingBusId(null);
      void qc.invalidateQueries({ queryKey: ['buses'] });
    },
  });

  const deleteBusMutation = useMutation({
    mutationFn: deleteBus,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['buses'] });
      void qc.invalidateQueries({ queryKey: ['bus-assignments'] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (payload: { busId: string; data: Omit<BusAssignment, 'id' | 'busId'> }) =>
      assignBus(payload.busId, payload.data),
    onSuccess: () => {
      setAssignmentForm({ busId: '', routeId: '', startTime: '', endTime: '' });
      void qc.invalidateQueries({ queryKey: ['bus-assignments'] });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['bus-assignments'] });
    },
  });

  const seatMapMutation = useMutation({
    mutationFn: (payload: { busId: string; seats: Seat[] }) =>
      updateSeatMap(payload.busId, payload.seats),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['seat-map', seatBusId] });
    },
  });

  const handleSubmitBus = () => {
    if (!busForm.operatorId || !busForm.name || !busForm.plateNumber) return;
    if (editingBusId) {
      updateBusMutation.mutate({ id: editingBusId, data: busForm });
    } else {
      createBusMutation.mutate(busForm);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Buses (mock now, DB-ready later)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Operator ID
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={busForm.operatorId}
                onChange={(e) =>
                  setBusForm((prev) => ({ ...prev, operatorId: e.target.value }))
                }
                placeholder="0000-...-0001"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Name
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={busForm.name}
                onChange={(e) =>
                  setBusForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Sleeper 40"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Plate
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={busForm.plateNumber}
                onChange={(e) =>
                  setBusForm((prev) => ({ ...prev, plateNumber: e.target.value }))
                }
                placeholder="51F-12345"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Model
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={busForm.model ?? ''}
                onChange={(e) =>
                  setBusForm((prev) => ({ ...prev, model: e.target.value }))
                }
                placeholder="Hyundai"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Seat Capacity
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                type="number"
                min={1}
                value={busForm.seatCapacity}
                onChange={(e) =>
                  setBusForm((prev) => ({
                    ...prev,
                    seatCapacity: Number.isFinite(Number(e.target.value))
                      ? Number(e.target.value)
                      : 1,
                  }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Seat Meta JSON
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={busForm.seatMetaJson ?? ''}
                onChange={(e) =>
                  setBusForm((prev) => ({ ...prev, seatMetaJson: e.target.value }))
                }
                placeholder='{"layout":"2x1"}'
              />
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmitBus}
              disabled={
                createBusMutation.isPending || updateBusMutation.isPending ||
                !busForm.operatorId || !busForm.name || !busForm.plateNumber
              }
            >
              {editingBusId
                ? updateBusMutation.isPending
                  ? 'Saving…'
                  : 'Update Bus'
                : createBusMutation.isPending
                ? 'Saving…'
                : 'Create Bus'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBusForm(initialBus);
                setEditingBusId(null);
              }}
            >
              Reset
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Plate</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell>{bus.name}</TableCell>
                    <TableCell>{bus.plateNumber}</TableCell>
                    <TableCell>{bus.operatorId}</TableCell>
                    <TableCell>{bus.seatCapacity}</TableCell>
                    <TableCell>{bus.model ?? '—'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingBusId(bus.id);
                          setBusForm({
                            operatorId: bus.operatorId,
                            name: bus.name,
                            plateNumber: bus.plateNumber,
                            model: bus.model,
                            seatCapacity: bus.seatCapacity,
                            seatMetaJson: bus.seatMetaJson,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBusMutation.mutate(bus.id)}
                        disabled={deleteBusMutation.isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bus Assignments (conflict-checked)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Bus
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={assignmentForm.busId}
                onChange={(e) =>
                  setAssignmentForm((prev) => ({ ...prev, busId: e.target.value }))
                }
              >
                <option value="">Select bus</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.plateNumber})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Route
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={assignmentForm.routeId}
                onChange={(e) =>
                  setAssignmentForm((prev) => ({ ...prev, routeId: e.target.value }))
                }
              >
                <option value="">Select route</option>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.origin} → {r.destination}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Start
              <input
                type="datetime-local"
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={assignmentForm.startTime}
                onChange={(e) =>
                  setAssignmentForm((prev) => ({ ...prev, startTime: e.target.value }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              End
              <input
                type="datetime-local"
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={assignmentForm.endTime}
                onChange={(e) =>
                  setAssignmentForm((prev) => ({ ...prev, endTime: e.target.value }))
                }
              />
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                assignmentForm.busId &&
                assignmentForm.routeId &&
                assignmentForm.startTime &&
                assignmentForm.endTime &&
                assignMutation.mutate({
                  busId: assignmentForm.busId,
                  data: {
                    routeId: assignmentForm.routeId,
                    startTime: assignmentForm.startTime,
                    endTime: assignmentForm.endTime,
                  },
                })
              }
              disabled={
                assignMutation.isPending ||
                !assignmentForm.busId ||
                !assignmentForm.routeId ||
                !assignmentForm.startTime ||
                !assignmentForm.endTime
              }
            >
              {assignMutation.isPending ? 'Assigning…' : 'Assign Bus'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setAssignmentForm({ busId: '', routeId: '', startTime: '', endTime: '' })
              }
            >
              Reset
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => {
                  const bus = buses.find((b) => b.id === a.busId);
                  const route = routes.find((r) => r.id === a.routeId);
                  return (
                    <TableRow key={a.id}>
                      <TableCell>{bus ? `${bus.name} (${bus.plateNumber})` : a.busId}</TableCell>
                      <TableCell>
                        {route ? `${route.origin} → ${route.destination}` : a.routeId}
                      </TableCell>
                      <TableCell>{new Date(a.startTime).toLocaleString()}</TableCell>
                      <TableCell>{new Date(a.endTime).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteAssignmentMutation.mutate(a.id)}
                          disabled={deleteAssignmentMutation.isPending}
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

      <Card>
        <CardHeader>
          <CardTitle>Seat Map Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Bus
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={seatBusId}
                onChange={(e) => setSeatBusId(e.target.value)}
              >
                <option value="">Select bus</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.plateNumber})
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="sm"
              onClick={() => seatBusId && refetchSeatMap()}
              disabled={!seatBusId}
            >
              Load Seats
            </Button>
            <Button
              size="sm"
              onClick={() => seatBusId && seatMapMutation.mutate({ busId: seatBusId, seats })}
              disabled={!seatBusId || seatMapMutation.isPending}
            >
              {seatMapMutation.isPending ? 'Saving…' : 'Save Seat Map'}
            </Button>
          </div>

          {seatBusId ? (
            <div className="rounded-md border p-3 space-y-2">
              <div className="grid gap-2 md:grid-cols-4">
                {seats.length ? (
                  seats.map((seat, idx) => (
                    <div
                      key={seat.id ?? `${seat.seatCode}-${idx}`}
                      className="border rounded-md p-2 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>{seat.seatCode}</span>
                        <label className="text-xs flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={seat.isActive}
                            onChange={(e) =>
                              setSeats((prev) =>
                                prev.map((s, i) =>
                                  i === idx ? { ...s, isActive: e.target.checked } : s,
                                ),
                              )
                            }
                          />
                          Active
                        </label>
                      </div>
                      <input
                        className="border-input bg-background text-xs px-2 py-1 rounded-md border"
                        value={seat.seatType}
                        onChange={(e) =>
                          setSeats((prev) =>
                            prev.map((s, i) => (i === idx ? { ...s, seatType: e.target.value } : s)),
                          )
                        }
                        placeholder="seat type"
                      />
                      <input
                        className="border-input bg-background text-xs px-2 py-1 rounded-md border"
                        type="number"
                        min={0}
                        value={seat.price ?? 0}
                        onChange={(e) =>
                          setSeats((prev) =>
                            prev.map((s, i) =>
                              i === idx
                                ? { ...s, price: Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 0 }
                                : s,
                            ),
                          )
                        }
                        placeholder="price"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No seats found for this bus.</div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a bus to edit its seat map.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
