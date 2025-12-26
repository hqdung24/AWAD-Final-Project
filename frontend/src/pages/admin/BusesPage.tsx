import { useEffect, useMemo, useState } from 'react';
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
import { listOperators, type Operator } from '@/services/operatorService';
import {
  deleteBusPhoto,
  listBusPhotos,
  uploadBusPhoto,
  type MediaItem,
} from '@/services/busMediaService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/notify';

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
  const [isUploading, setIsUploading] = useState(false);
  const [seatBusId, setSeatBusId] = useState<string>('');
  const [seatForm, setSeatForm] = useState<{ seatCode: string; seatType: string }>({
    seatCode: '',
    seatType: 'STANDARD',
  });
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [editSeatForm, setEditSeatForm] = useState<{
    seatCode: string;
    seatType: string;
    isActive: boolean;
  }>({
    seatCode: '',
    seatType: 'STANDARD',
    isActive: true,
  });
  const [seatDrafts, setSeatDrafts] = useState<Seat[]>([]);
  const [busFilters, setBusFilters] = useState<{
    operatorId?: string;
    query?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const seatRows = useMemo(() => {
    const rows = new Map<string, Seat[]>();
    seatDrafts.forEach((s) => {
      const row = s.seatCode?.charAt(0) || '?';
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row)!.push(s);
    });
    rows.forEach((list) =>
      list.sort(
        (a, b) => parseInt(a.seatCode.slice(1)) - parseInt(b.seatCode.slice(1)),
      ),
    );
    return Array.from(rows.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [seatDrafts]);

  const { data: buses = [] } = useQuery<Bus[]>({
    queryKey: ['buses', busFilters],
    queryFn: () => listBuses({ operatorId: busFilters.operatorId, limit: 200 }),
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
      setEditingSeatId(null);
      setEditSeatForm({ seatCode: '', seatType: 'STANDARD', isActive: true });
    }
  }, [seats]);

  const createBusMutation = useMutation({
    mutationFn: createBus,
    onSuccess: () => {
      setBusForm(initialBus);
      setEditingBusId(null);
      void qc.invalidateQueries({ queryKey: ['buses'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to create bus';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const updateBusMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Omit<Bus, 'id'>> }) =>
      updateBus(payload.id, payload.data),
    onSuccess: () => {
      setEditingBusId(null);
      void qc.invalidateQueries({ queryKey: ['buses'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to update bus';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const deleteBusMutation = useMutation({
    mutationFn: deleteBus,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['buses'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to delete bus';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
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
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to add seat';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const updateSeatMutation = useMutation({
    mutationFn: (payload: { busId: string; id: string; data: Partial<Seat> }) =>
      updateSeat(payload.busId, payload.id, payload.data),
    onSuccess: () => {
      void refetchSeats();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to update seat';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const deleteSeatMutation = useMutation({
    mutationFn: deleteSeat,
    onSuccess: () => {
      void refetchSeats();
      setEditingSeatId(null);
      setEditSeatForm({ seatCode: '', seatType: 'STANDARD', isActive: true });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to delete seat';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
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

  const selectedSeat = useMemo(
    () => seatDrafts.find((s) => s.id === editingSeatId),
    [seatDrafts, editingSeatId],
  );

  const handleSaveSelectedSeat = () => {
    if (!seatBusId || !editingSeatId) return;
    updateSeatMutation.mutate({
      busId: seatBusId,
      id: editingSeatId,
      data: {
        seatCode: editSeatForm.seatCode,
        seatType: editSeatForm.seatType,
        isActive: editSeatForm.isActive,
      },
    });
  };

  const handleDeleteSelectedSeat = () => {
    if (!editingSeatId) return;
    deleteSeatMutation.mutate(editingSeatId);
  };

  const { data: busPhotos = [] } = useQuery<MediaItem[]>({
    queryKey: ['bus-photos', editingBusId],
    queryFn: () => listBusPhotos(editingBusId!),
    enabled: Boolean(editingBusId),
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight">Buses</h1>
        <p className="text-muted-foreground text-sm">
          Manage bus fleet, seats, and operators.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Buses</CardTitle>
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
                  setBusFilters({});
                  setPage(1);
                }}
              >
                Reset filters
              </Button>
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Operator
                <select
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  value={busFilters.operatorId ?? ''}
                  onChange={(e) => {
                    setBusFilters((prev) => ({
                      ...prev,
                      operatorId: e.target.value || undefined,
                    }));
                    setPage(1);
                  }}
                >
                  <option value="">All operators</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Search (plate/name/model)
                <input
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  value={busFilters.query ?? ''}
                  onChange={(e) => {
                    setBusFilters((prev) => ({
                      ...prev,
                      query: e.target.value || undefined,
                    }));
                    setPage(1);
                  }}
                  placeholder="51F / Hyundai / VIP"
                />
              </label>
            </div>
          </div>

          {/* Form */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <span>Bus form</span>
            {editingBusId && <span>Editing bus: {editingBusId}</span>}
          </div>
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
              <textarea
                className="border-input bg-background text-sm px-3 py-2 rounded-md border min-h-[80px] font-mono"
                value={busForm.amenitiesJson ?? ''}
                onChange={(e) =>
                  setBusForm((prev) => ({ ...prev, amenitiesJson: e.target.value }))
                }
                placeholder='{"wifi":true,"water":true,"charger":true}'
              />
              <span className="text-[11px] text-muted-foreground">
                Example: {"{ \"wifi\": true, \"water\": true, \"charger\": true }"}
              </span>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1 md:col-span-2">
              Bus Photos
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading || !editingBusId}
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length === 0) return;
                  if (!editingBusId) {
                    notify.error('Create the bus before uploading photos');
                    e.currentTarget.value = '';
                    return;
                  }
                  setIsUploading(true);
                  try {
                    const existing = await listBusPhotos(editingBusId);
                    await Promise.all(existing.map((media) => deleteBusPhoto(media.id)));
                    await Promise.all(files.map((file) => uploadBusPhoto(editingBusId, file)));
                    void qc.invalidateQueries({ queryKey: ['bus-photos', editingBusId] });
                  } catch (error: any) {
                    const message =
                      error?.response?.data?.message ||
                      error?.message ||
                      'Failed to upload photos';
                    notify.error(Array.isArray(message) ? message.join(', ') : message);
                  } finally {
                    setIsUploading(false);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <span className="text-[11px] text-muted-foreground">
                Upload JPG/PNG/GIF images. Bus must be created first.
              </span>
            </label>
            <div className="md:col-span-3">
              {busPhotos.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {busPhotos.map((media) => (
                    <div key={media.id} className="relative">
                      <img
                        src={media.url}
                        alt="Bus"
                        className="h-24 w-36 rounded-md object-cover border"
                      />
                      <button
                        type="button"
                        className="absolute -right-2 -top-2 rounded-full bg-destructive text-destructive-foreground text-xs px-2 py-1"
                        onClick={async () => {
                          try {
                            await deleteBusPhoto(media.id);
                            void qc.invalidateQueries({ queryKey: ['bus-photos', editingBusId] });
                          } catch (error: any) {
                            const message =
                              error?.response?.data?.message ||
                              error?.message ||
                              'Failed to delete photo';
                            notify.error(Array.isArray(message) ? message.join(', ') : message);
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No photos uploaded yet.</p>
              )}
            </div>
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
                {buses
                  .filter((bus) => {
                    if (busFilters.operatorId && bus.operatorId !== busFilters.operatorId)
                      return false;
                    if (busFilters.query) {
                      const q = busFilters.query.toLowerCase();
                      const text = `${bus.plateNumber} ${bus.name ?? ''} ${bus.model ?? ''} ${
                        bus.busType ?? ''
                      }`.toLowerCase();
                      if (!text.includes(q)) return false;
                    }
                    return true;
                  })
                  .slice((page - 1) * pageSize, page * pageSize)
                  .map((bus, idx) => (
                  <TableRow
                    key={bus.id}
                    className={idx % 2 === 1 ? 'bg-muted/40' : undefined}
                  >
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
          <div className="flex items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
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
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <span>
                Page {page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={
                  buses.filter((bus) => {
                    if (busFilters.operatorId && bus.operatorId !== busFilters.operatorId)
                      return false;
                    if (busFilters.query) {
                      const q = busFilters.query.toLowerCase();
                      const text = `${bus.plateNumber} ${bus.name ?? ''} ${bus.model ?? ''} ${
                        bus.busType ?? ''
                      }`.toLowerCase();
                      if (!text.includes(q)) return false;
                    }
                    return true;
                  }).length <= page * pageSize
                }
              >
                Next
              </Button>
            </div>
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

              {/* Seat map preview + edit */}
              <div className="rounded-md border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Seat layout</p>
                    <p className="text-xs text-muted-foreground">
                      Click a seat to edit/delete. Colors show active/inactive.
                    </p>
                  </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                    Active
                  </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block h-3 w-3 rounded-sm bg-rose-100 border border-rose-300" />
                      Inactive
                    </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-sm bg-amber-100 border border-amber-300" />
                    Selected
                  </span>
                </div>
              </div>
                {/* Edit selected seat */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="text-sm font-medium">Edit selected seat</p>
                    <p className="text-xs text-muted-foreground">
                      Choose a seat in the map above to edit or delete it.
                    </p>
                  </div>
                  {selectedSeat && (
                    <span className="text-xs text-muted-foreground">
                      ID: {selectedSeat.id}
                    </span>
                  )}
                </div>

                {selectedSeat ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                        Seat code
                        <input
                          className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                          value={editSeatForm.seatCode}
                          onChange={(e) =>
                            setEditSeatForm((prev) => ({
                              ...prev,
                              seatCode: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                        Seat type
                        <select
                          className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                          value={editSeatForm.seatType}
                          onChange={(e) =>
                            setEditSeatForm((prev) => ({
                              ...prev,
                              seatType: e.target.value,
                            }))
                          }
                        >
                          {seatTypes.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editSeatForm.isActive}
                          onChange={(e) =>
                            setEditSeatForm((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                        />
                        Active
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveSelectedSeat}
                        disabled={updateSeatMutation.isPending}
                      >
                        {updateSeatMutation.isPending ? 'Saving…' : 'Save changes'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteSelectedSeat}
                        disabled={deleteSeatMutation.isPending}
                      >
                        Delete seat
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSeatId(null);
                          setEditSeatForm({
                            seatCode: '',
                            seatType: 'STANDARD',
                            isActive: true,
                          });
                        }}
                      >
                        Clear selection
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No seat selected. Click a seat in the map to edit.
                  </p>
                )}

                <div className="space-y-2 max-h-[320px] overflow-auto rounded-md border bg-muted/20 p-2">
                  {seatRows.map(([rowLetter, seats]) => {
                    const left = seats.filter(
                      (s) => parseInt(s.seatCode.slice(1)) <= 2,
                    );
                    const right = seats.filter(
                      (s) => parseInt(s.seatCode.slice(1)) > 2,
                    );
                    return (
                      <div
                        key={rowLetter}
                        className="flex items-center gap-4 rounded-md border px-3 py-2 bg-background"
                      >
                        <span className="text-sm font-semibold w-6 text-center">
                          {rowLetter}
                        </span>
                        <div className="grid grid-cols-2 gap-6 flex-1">
                          {[left, right].map((side, idx) => (
                            <div key={idx} className="flex gap-2">
                              {side.map((seat) => {
                                const isSelected = editingSeatId === seat.id;
                                return (
                                  <button
                                    key={seat.id}
                                    type="button"
                                    onClick={() => {
                                      setEditingSeatId(seat.id);
                                      setEditSeatForm({
                                        seatCode: seat.seatCode,
                                        seatType: seat.seatType,
                                        isActive: seat.isActive,
                                      });
                                    }}
                                    className={`rounded-md px-3 py-2 text-sm font-medium border text-left transition ${
                                      isSelected
                                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                                        : seat.isActive
                                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                                          : 'bg-rose-100 border-rose-300 text-rose-900'
                                    }`}
                                    title={`${seat.seatCode} • ${seat.seatType}`}
                                  >
                                    {seat.seatCode}
                                    <span className="block text-[11px] text-muted-foreground">
                                      {seat.seatType}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
