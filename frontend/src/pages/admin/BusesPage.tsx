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
  listSeats,
  createSeat,
  updateSeat,
  deleteSeat,
  type Bus,
  type Seat,
} from '@/services/busService';
import { listOperators, type Operator } from '@/services/adminRoutesService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const initialBus: Omit<Bus, 'id'> = {
  operatorId: '',
  name: '',
  plateNumber: '',
  model: '',
  busType: '',
  seatCapacity: 40,
  amenitiesJson: '',
};

const seatTypes = ['STANDARD', 'PREMIUM', 'VIP'];

export default function BusesPage() {
  const qc = useQueryClient();
  const [busForm, setBusForm] = useState<Omit<Bus, 'id'>>(initialBus);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [seatBusId, setSeatBusId] = useState<string>('');
  const [seatForm, setSeatForm] = useState<{ seatCode: string; seatType: string }>({
    seatCode: '',
    seatType: 'STANDARD',
  });
  const [seatDrafts, setSeatDrafts] = useState<Seat[]>([]);

  const { data: buses = [] } = useQuery<Bus[]>({
    queryKey: ['buses'],
    queryFn: listBuses,
  });
  useEffect(() => {
    if (!seatBusId && buses.length > 0) {
      setSeatBusId(buses[0].id);
    }
  }, [buses, seatBusId]);

  const { data: operators = [] } = useQuery<Operator[]>({
    queryKey: ['operators'],
    queryFn: listOperators,
  });

  const {
    data: seats = [],
    refetch: refetchSeats,
    isFetching: seatsLoading,
  } = useQuery<Seat[]>({
    queryKey: ['seats', seatBusId],
    queryFn: () => listSeats(seatBusId),
    enabled: Boolean(seatBusId),
  });

  useEffect(() => {
    if (seats) {
      setSeatDrafts(seats);
    }
  }, [seats]);

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
    },
  });

  const createSeatMutation = useMutation({
    mutationFn: (payload: { busId: string; seatCode: string; seatType: string }) =>
      createSeat(payload.busId, {
        seatCode: payload.seatCode,
        seatType: payload.seatType,
      }),
    onSuccess: () => {
      setSeatForm({ seatCode: '', seatType: 'STANDARD' });
      void refetchSeats();
    },
  });

  const updateSeatMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Seat> }) =>
      updateSeat(payload.id, payload.data),
    onSuccess: () => {
      void refetchSeats();
    },
  });

  const deleteSeatMutation = useMutation({
    mutationFn: deleteSeat,
    onSuccess: () => {
      void refetchSeats();
    },
  });

  const handleSubmitBus = () => {
    if (!busForm.operatorId || !busForm.plateNumber || !busForm.model) return;
    const { name: _ignoredName, ...payload } = busForm;
    if (editingBusId) {
      updateBusMutation.mutate({ id: editingBusId, data: payload });
    } else {
      createBusMutation.mutate(payload);
    }
  };

  const handleCreateSeat = () => {
    if (!seatBusId || !seatForm.seatCode) return;
    createSeatMutation.mutate({
      busId: seatBusId,
      seatCode: seatForm.seatCode,
      seatType: seatForm.seatType,
    });
  };

  const handleSeatDraftChange = (id: string, partial: Partial<Seat>) => {
    setSeatDrafts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    );
  };

  const handleSaveSeat = (seat: Seat) => {
    updateSeatMutation.mutate({
      id: seat.id,
      data: {
        seatCode: seat.seatCode,
        seatType: seat.seatType,
        isActive: seat.isActive,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Buses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Operator
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={busForm.operatorId}
                onChange={(e) =>
                  setBusForm((prev) => ({ ...prev, operatorId: e.target.value }))
                }
              >
                <option value="">Select operator</option>
                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name}
                  </option>
                ))}
              </select>
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
              Bus Type
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={busForm.busType ?? ''}
                onChange={(e) =>
                  setBusForm((prev) => ({ ...prev, busType: e.target.value }))
                }
                placeholder="Sleeper / Seat / VIP Sleeper"
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
              Amenities JSON
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={busForm.amenitiesJson ?? ''}
                onChange={(e) =>
                  setBusForm((prev) => ({ ...prev, amenitiesJson: e.target.value }))
                }
                placeholder='{"wifi":true,"water":true}'
              />
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSubmitBus}
              disabled={
                createBusMutation.isPending || updateBusMutation.isPending ||
                !busForm.operatorId || !busForm.plateNumber || !busForm.model
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
                  <TableHead>Plate</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Bus Type</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell>{bus.plateNumber}</TableCell>
                    <TableCell>{bus.name ?? '—'}</TableCell>
                    <TableCell>{bus.model ?? '—'}</TableCell>
                    <TableCell>{bus.busType ?? '—'}</TableCell>
                    <TableCell>{bus.operator?.name ?? bus.operatorId}</TableCell>
                    <TableCell>{bus.seatCapacity}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingBusId(bus.id);
                          setBusForm({
                            operatorId: bus.operatorId,
                            name: bus.name ?? '',
                            plateNumber: bus.plateNumber,
                            model: bus.model,
                            busType: bus.busType,
                            seatCapacity: bus.seatCapacity,
                            amenitiesJson: bus.amenitiesJson,
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
          <CardTitle className="flex items-center justify-between">
            <span>Seat Map Configuration</span>
            {seatsLoading && (
              <span className="text-xs text-muted-foreground">Loading…</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Bus
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border min-w-[220px]"
                value={seatBusId}
                onChange={(e) => setSeatBusId(e.target.value)}
              >
                <option value="">Select bus</option>
                {buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name ? `${b.name} — ` : ''}
                    {b.plateNumber}
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => seatBusId && refetchSeats()}
              disabled={!seatBusId || seatsLoading}
            >
              Refresh seats
            </Button>
          </div>

          {seatBusId ? (
            <>
              <div className="grid gap-3 md:grid-cols-4">
                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Seat code
                  <input
                    className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                    value={seatForm.seatCode}
                    onChange={(e) =>
                      setSeatForm((prev) => ({ ...prev, seatCode: e.target.value }))
                    }
                    placeholder="A1"
                  />
                </label>
                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Seat type
                  <select
                    className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                    value={seatForm.seatType}
                    onChange={(e) =>
                      setSeatForm((prev) => ({ ...prev, seatType: e.target.value }))
                    }
                  >
                    {seatTypes.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateSeat}
                    disabled={
                      createSeatMutation.isPending ||
                      !seatForm.seatCode ||
                      !seatForm.seatType
                    }
                  >
                    {createSeatMutation.isPending ? 'Saving…' : 'Add Seat'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSeatForm({ seatCode: '', seatType: 'STANDARD' })
                    }
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {seatDrafts.map((seat) => (
                  <div
                    key={seat.id}
                    className="border rounded-md p-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        className="border-input bg-background text-sm px-2 py-1 rounded-md border w-1/2"
                        value={seat.seatCode}
                        onChange={(e) =>
                          handleSeatDraftChange(seat.id, { seatCode: e.target.value })
                        }
                      />
                      <label className="text-xs flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={seat.isActive}
                          onChange={(e) =>
                            handleSeatDraftChange(seat.id, { isActive: e.target.checked })
                          }
                        />
                        Active
                      </label>
                    </div>
                    <select
                      className="border-input bg-background text-sm px-2 py-1 rounded-md border"
                      value={seat.seatType}
                      onChange={(e) =>
                        handleSeatDraftChange(seat.id, { seatType: e.target.value })
                      }
                    >
                      {seatTypes.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveSeat(seat)}
                        disabled={updateSeatMutation.isPending}
                      >
                        {updateSeatMutation.isPending ? 'Saving…' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSeatMutation.mutate(seat.id!)}
                        disabled={deleteSeatMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {!seatDrafts.length && (
                  <p className="text-sm text-muted-foreground">
                    No seats configured for this bus yet.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a bus to configure its seats.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
