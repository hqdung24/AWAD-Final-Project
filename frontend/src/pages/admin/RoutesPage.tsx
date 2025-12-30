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
  listAdminRoutes,
  createAdminRoute,
  updateAdminRoute,
  deleteAdminRoute,
  type AdminRoute,
} from '@/services/adminRoutesService';
import { listOperators, type Operator } from '@/services/operatorService';
import {
  listRoutesWithStops,
  listRoutePoints,
  createRoutePoint,
  updateRoutePoint,
  deleteRoutePoint,
  type RouteStop,
  type RouteWithStops,
  type RoutePointPayload,
} from '@/services/routeStops';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '@/lib/notify';

const initialRouteForm: AdminRoute = {
  id: '',
  operatorId: '',
  origin: '',
  destination: '',
  distanceKm: 0,
  estimatedMinutes: 0,
  notes: '',
};

export default function RoutesPage() {
  const qc = useQueryClient();
  const [createForm, setCreateForm] = useState<AdminRoute>(initialRouteForm);
  const [editForm, setEditForm] = useState<AdminRoute | null>(null);
  const [filters, setFilters] = useState<{
    operatorId?: string;
    origin?: string;
    destination?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [routePointRouteId, setRoutePointRouteId] = useState<string>('');
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [routePointForm, setRoutePointForm] = useState<RoutePointPayload>({
    type: 'pickup',
    name: '',
    address: '',
    orderIndex: 0,
    latitude: null,
    longitude: null,
  });
  const [routePointFilters, setRoutePointFilters] = useState<{
    query?: string;
    type?: 'pickup' | 'dropoff';
  }>({});

  const { data: adminRoutesResult, isLoading: routesLoading } = useQuery<
    AdminRoute[] | RouteWithStops[]
  >({
    queryKey: ['admin-routes'],
    queryFn: async () => {
      // prefer full routes with stops; fall back to admin routes if needed
      try {
        return await listRoutesWithStops();
      } catch (e) {
        return await listAdminRoutes();
      }
    },
  });
  const adminRoutes: AdminRoute[] =
    (adminRoutesResult as { data?: AdminRoute[] } | undefined)?.data ??
    (adminRoutesResult as AdminRoute[]) ??
    [];

  const { data: operators = [] } = useQuery<Operator[]>({
    queryKey: ['operators'],
    queryFn: listOperators,
  });

  const { data: routePoints = [], isLoading: routePointsLoading } = useQuery<RouteStop[]>({
    queryKey: ['route-points', routePointRouteId],
    queryFn: () => listRoutePoints(routePointRouteId),
    enabled: Boolean(routePointRouteId),
  });

  useEffect(() => {
    if (!routePointRouteId && adminRoutes.length > 0) {
      setRoutePointRouteId(adminRoutes[0].id);
    }
  }, [adminRoutes, routePointRouteId]);

  useEffect(() => {
    setEditingPointId(null);
    setRoutePointForm({
      type: 'pickup',
      name: '',
      address: '',
      orderIndex: 0,
      latitude: null,
      longitude: null,
    });
  }, [routePointRouteId]);

  const createMutation = useMutation({
    mutationFn: createAdminRoute,
    onSuccess: () => {
      setCreateForm(initialRouteForm);
      void qc.invalidateQueries({ queryKey: ['admin-routes'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to create route';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Omit<AdminRoute, 'id'>> }) =>
      updateAdminRoute(payload.id, payload.data),
    onSuccess: () => {
      setEditForm(null);
      void qc.invalidateQueries({ queryKey: ['admin-routes'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to update route';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminRoute,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-routes'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to delete route';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const createPointMutation = useMutation({
    mutationFn: (payload: { routeId: string; data: RoutePointPayload }) =>
      createRoutePoint(payload.routeId, payload.data),
    onSuccess: () => {
      setRoutePointForm({
        type: 'pickup',
        name: '',
        address: '',
        orderIndex: 0,
        latitude: null,
        longitude: null,
      });
      setEditingPointId(null);
      void qc.invalidateQueries({ queryKey: ['route-points', routePointRouteId] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to add route point';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const updatePointMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<RoutePointPayload> }) =>
      updateRoutePoint(payload.id, payload.data),
    onSuccess: () => {
      setEditingPointId(null);
      setRoutePointForm({
        type: 'pickup',
        name: '',
        address: '',
        orderIndex: 0,
        latitude: null,
        longitude: null,
      });
      void qc.invalidateQueries({ queryKey: ['route-points', routePointRouteId] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to update route point';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const deletePointMutation = useMutation({
    mutationFn: deleteRoutePoint,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['route-points', routePointRouteId] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to delete route point';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const routePointRows = routePoints
    .filter((point) => {
      if (routePointFilters.type && point.type !== routePointFilters.type) {
        return false;
      }
      if (routePointFilters.query) {
        const q = routePointFilters.query.toLowerCase();
        const hay = `${point.name ?? ''} ${point.address ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight">Routes</h1>
        <p className="text-muted-foreground text-sm">
          Manage routes, operators, and stops.
        </p>
      </header>

      <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Manage Routes</span>
              {routesLoading && (
                <span className="text-muted-foreground text-xs">Loading…</span>
              )}
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
              <div className="grid gap-2 md:grid-cols-4">
                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Operator
                  <select
                    className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                    value={filters.operatorId ?? ''}
                    onChange={(e) => {
                      setFilters((prev) => ({
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
                  Origin
                  <input
                    className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                    placeholder="Search origin"
                    value={filters.origin ?? ''}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, origin: e.target.value || undefined }));
                      setPage(1);
                    }}
                  />
                </label>
                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Destination
                  <input
                    className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                    placeholder="Search destination"
                    value={filters.destination ?? ''}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        destination: e.target.value || undefined,
                      }));
                      setPage(1);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
              <div className="flex items-center justify-between text-xs text-muted-foreground md:col-span-2">
                <span>Route form</span>
                {editForm && <span>Editing route: {editForm.id}</span>}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Operator
                <select
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  value={createForm.operatorId}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      operatorId: e.target.value,
                    }))
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
                Origin
                <input
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  placeholder="Ho Chi Minh City"
                  value={createForm.origin}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, origin: e.target.value }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Destination
                <input
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  placeholder="Hanoi"
                  value={createForm.destination}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="grid gap-2 md:grid-cols-3 items-center">
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Distance (km)
                <input
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  type="number"
                  min={0}
                  placeholder="1700"
                  value={createForm.distanceKm}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      distanceKm: Number.isFinite(Number(e.target.value))
                        ? Number(e.target.value)
                        : 0,
                    }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                ETA (minutes)
                <input
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  type="number"
                  min={0}
                  placeholder="1500"
                  value={createForm.estimatedMinutes}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      estimatedMinutes: Number.isFinite(Number(e.target.value))
                        ? Number(e.target.value)
                        : 0,
                    }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Notes
                <input
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  placeholder="Notes"
                  value={createForm.notes}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2 md:col-span-2">
              <Button
                size="sm"
                onClick={() =>
                  createMutation.mutate({
                    operatorId: createForm.operatorId,
                    origin: createForm.origin,
                    destination: createForm.destination,
                    notes: createForm.notes,
                    distanceKm: createForm.distanceKm,
                    estimatedMinutes: createForm.estimatedMinutes,
                  })
                }
                disabled={
                  createMutation.isPending ||
                  !createForm.operatorId ||
                  !createForm.origin ||
                  !createForm.destination
                }
              >
                {createMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateForm(initialRouteForm)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Distance (km)</TableHead>
                  <TableHead>ETA (min)</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {adminRoutes
              .filter((route) => {
                if (filters.operatorId && route.operatorId !== filters.operatorId) return false;
                if (filters.origin) {
                  const q = filters.origin.toLowerCase();
                  if (!route.origin.toLowerCase().includes(q)) return false;
                }
                if (filters.destination) {
                  const q = filters.destination.toLowerCase();
                  if (!route.destination.toLowerCase().includes(q)) return false;
                }
                return true;
              })
              .slice((page - 1) * pageSize, page * pageSize)
              .map((route, idx) => {
              const isEditing = editForm?.id === route.id;
              const operatorLabel = route.operator?.name ?? route.operatorId;
              return (
                <TableRow
                  key={route.id}
                  className={idx % 2 === 1 ? 'bg-muted/40' : undefined}
                >
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border-input bg-background text-sm px-2 py-1 rounded-md border w-full"
                          value={editForm?.origin ?? ''}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev ? { ...prev, origin: e.target.value } : prev,
                            )
                          }
                        />
                      ) : (
                        route.origin
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border-input bg-background text-sm px-2 py-1 rounded-md border w-full"
                          value={editForm?.destination ?? ''}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev
                                ? { ...prev, destination: e.target.value }
                                : prev,
                            )
                          }
                        />
                      ) : (
                        route.destination
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <select
                          className="border-input bg-background text-sm px-2 py-1 rounded-md border w-full"
                          value={editForm?.operatorId ?? ''}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev ? { ...prev, operatorId: e.target.value } : prev,
                            )
                          }
                        >
                          <option value="">Select operator</option>
                          {operators.map((op) => (
                            <option key={op.id} value={op.id}>
                              {op.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        operatorLabel
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border-input bg-background text-sm px-2 py-1 rounded-md border w-full"
                          type="number"
                          min={0}
                          value={editForm?.distanceKm ?? 0}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev
                                ? { ...prev, distanceKm: Number(e.target.value) }
                                : prev,
                            )
                          }
                        />
                      ) : (
                        route.distanceKm
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border-input bg-background text-sm px-2 py-1 rounded-md border w-full"
                          type="number"
                          min={0}
                          value={editForm?.estimatedMinutes ?? 0}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    estimatedMinutes: Number(e.target.value),
                                  }
                                : prev,
                            )
                          }
                        />
                      ) : (
                        route.estimatedMinutes
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <input
                          className="border-input bg-background text-sm px-2 py-1 rounded-md border w-full"
                          value={editForm?.notes ?? ''}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev ? { ...prev, notes: e.target.value } : prev,
                            )
                          }
                        />
                      ) : (
                        route.notes ?? '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditForm(null)}
                            disabled={updateMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              editForm &&
                              updateMutation.mutate({
                                id: editForm.id,
                                data: {
                                  operatorId: editForm.operatorId,
                                  origin: editForm.origin,
                                  destination: editForm.destination,
                                  distanceKm: editForm.distanceKm,
                                  estimatedMinutes: editForm.estimatedMinutes,
                                  notes: editForm.notes,
                                },
                              })
                            }
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending ? 'Saving…' : 'Save'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditForm(route)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMutation.mutate(route.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
                  adminRoutes.filter((route) => {
                    if (filters.operatorId && route.operatorId !== filters.operatorId) return false;
                    if (filters.origin) {
                      const q = filters.origin.toLowerCase();
                      if (!route.origin.toLowerCase().includes(q)) return false;
                    }
                    if (filters.destination) {
                      const q = filters.destination.toLowerCase();
                      if (!route.destination.toLowerCase().includes(q)) return false;
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
            <span>Route Points</span>
            {routePointsLoading && (
              <span className="text-muted-foreground text-xs">Loading…</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Route
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={routePointRouteId}
                onChange={(e) => setRoutePointRouteId(e.target.value)}
              >
                {adminRoutes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.origin} → {route.destination}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Filter type
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={routePointFilters.type ?? ''}
                onChange={(e) =>
                  setRoutePointFilters((prev) => ({
                    ...prev,
                    type: e.target.value
                      ? (e.target.value as 'pickup' | 'dropoff')
                      : undefined,
                  }))
                }
              >
                <option value="">All types</option>
                <option value="pickup">Pickup</option>
                <option value="dropoff">Dropoff</option>
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Search
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={routePointFilters.query ?? ''}
                onChange={(e) =>
                  setRoutePointFilters((prev) => ({
                    ...prev,
                    query: e.target.value || undefined,
                  }))
                }
                placeholder="Name or address"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-6">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Type
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={routePointForm.type}
                onChange={(e) =>
                  setRoutePointForm((prev) => ({
                    ...prev,
                    type: e.target.value as RoutePointPayload['type'],
                  }))
                }
              >
                <option value="pickup">Pickup</option>
                <option value="dropoff">Dropoff</option>
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1 md:col-span-2">
              Name
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={routePointForm.name}
                onChange={(e) =>
                  setRoutePointForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Route point name"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1 md:col-span-2">
              Address
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={routePointForm.address}
                onChange={(e) =>
                  setRoutePointForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Full address"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Order
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                type="number"
                min={0}
                value={routePointForm.orderIndex ?? 0}
                onChange={(e) =>
                  setRoutePointForm((prev) => ({
                    ...prev,
                    orderIndex: Number(e.target.value),
                  }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Latitude
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                type="number"
                step="0.0000001"
                value={routePointForm.latitude ?? ''}
                onChange={(e) =>
                  setRoutePointForm((prev) => ({
                    ...prev,
                    latitude: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Longitude
              <input
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                type="number"
                step="0.0000001"
                value={routePointForm.longitude ?? ''}
                onChange={(e) =>
                  setRoutePointForm((prev) => ({
                    ...prev,
                    longitude: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (!routePointRouteId) return;
                if (editingPointId) {
                  updatePointMutation.mutate({
                    id: editingPointId,
                    data: routePointForm,
                  });
                  return;
                }
                createPointMutation.mutate({
                  routeId: routePointRouteId,
                  data: routePointForm,
                });
              }}
              disabled={
                !routePointRouteId ||
                !routePointForm.name ||
                !routePointForm.address ||
                createPointMutation.isPending ||
                updatePointMutation.isPending
              }
            >
              {editingPointId ? 'Update point' : 'Add point'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingPointId(null);
                setRoutePointForm({
                  type: 'pickup',
                  name: '',
                  address: '',
                  orderIndex: 0,
                  latitude: null,
                  longitude: null,
                });
              }}
            >
              Clear
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Coords</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routePointRows.map((point) => (
                  <TableRow key={point.id ?? `${point.name}-${point.orderIndex}`}>
                    <TableCell>{point.orderIndex ?? 0}</TableCell>
                    <TableCell className="capitalize">{point.type}</TableCell>
                    <TableCell>{point.name}</TableCell>
                    <TableCell>{point.address ?? '—'}</TableCell>
                    <TableCell>
                      {point.latitude !== null &&
                      point.latitude !== undefined &&
                      point.longitude !== null &&
                      point.longitude !== undefined
                        ? `${point.latitude}, ${point.longitude}`
                        : '—'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!point.id) return;
                          setEditingPointId(point.id);
                          setRoutePointForm({
                            type: point.type,
                            name: point.name,
                            address: point.address ?? '',
                            orderIndex: point.orderIndex ?? 0,
                            latitude: point.latitude ?? null,
                            longitude: point.longitude ?? null,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => point.id && deletePointMutation.mutate(point.id)}
                        disabled={deletePointMutation.isPending}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {routePointRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No route points found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
