import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  type AdminRoute,
} from '@/services/adminRoutesService';
import { listOperators, type Operator } from '@/services/operatorService';
import {
  listRoutePoints,
  createRoutePoint,
  updateRoutePoint,
  deleteRoutePoint,
  type RouteStop,
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
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeModalMode, setRouteModalMode] = useState<'create' | 'edit'>('create');
  const [filters, setFilters] = useState<{
    operatorId?: string;
    origin?: string;
    destination?: string;
    isActive?: 'active' | 'inactive' | 'all';
  }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [routeOptionQuery, setRouteOptionQuery] = useState('');
  const [routePointRouteId, setRoutePointRouteId] = useState<string>('');
  const [routePointModalOpen, setRoutePointModalOpen] = useState(false);
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
    AdminRoute[]
  >({
    queryKey: ['admin-routes', filters.isActive, filters.operatorId],
    queryFn: async () => {
      const isActive =
        filters.isActive === 'all'
          ? undefined
          : filters.isActive === 'inactive'
          ? false
          : filters.isActive === 'active'
          ? true
          : true;
      return await listAdminRoutes({
        operatorId: filters.operatorId,
        isActive,
      });
    },
  });
  const adminRoutes: AdminRoute[] = adminRoutesResult ?? [];

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
      setRouteModalOpen(false);
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
      setRouteModalOpen(false);
      void qc.invalidateQueries({ queryKey: ['admin-routes'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to update route';
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
      setRoutePointModalOpen(false);
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
      setRoutePointModalOpen(false);
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

  const filteredRoutes = adminRoutes.filter((route) => {
    if (filters.origin) {
      const q = filters.origin.toLowerCase();
      if (!route.origin.toLowerCase().includes(q)) return false;
    }
    if (filters.destination) {
      const q = filters.destination.toLowerCase();
      if (!route.destination.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  const pagedRoutes = filteredRoutes.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(filteredRoutes.length / pageSize)) : 1;
  const selectedRoute = adminRoutes.find((route) => route.id === routePointRouteId);
  const pickupCount = routePoints.filter((point) => point.type === 'pickup').length;
  const dropoffCount = routePoints.filter((point) => point.type === 'dropoff').length;
  const routeOptionList = adminRoutes.filter((route) => {
    if (!routeOptionQuery) return true;
    const q = routeOptionQuery.toLowerCase();
    const hay = `${route.origin} ${route.destination} ${route.operator?.name ?? ''}`.toLowerCase();
    return hay.includes(q);
  });

  const openCreateRoute = () => {
    setRouteModalMode('create');
    setCreateForm(initialRouteForm);
    setEditForm(null);
    setRouteModalOpen(true);
  };

  const openEditRoute = (route: AdminRoute) => {
    setRouteModalMode('edit');
    setEditForm(route);
    setRouteModalOpen(true);
  };

  const openCreatePoint = () => {
    setEditingPointId(null);
    setRoutePointForm({
      type: 'pickup',
      name: '',
      address: '',
      orderIndex: 0,
      latitude: null,
      longitude: null,
    });
    setRoutePointModalOpen(true);
  };

  const openEditPoint = (point: RouteStop) => {
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
    setRoutePointModalOpen(true);
  };

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight">Routes</h1>
        <p className="text-muted-foreground text-sm">
          Manage routes, operators, and route points.
        </p>
      </header>

      <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Manage Routes</span>
              <div className="flex items-center gap-2">
                {routesLoading && (
                  <span className="text-muted-foreground text-xs">Loading…</span>
                )}
                <Button size="sm" onClick={openCreateRoute}>
                  New route
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{filteredRoutes.length} routes</Badge>
              <Badge variant="outline">{operators.length} operators</Badge>
            </div>

            <Separator />

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
                  Status
                  <select
                    className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                    value={filters.isActive ?? 'active'}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        isActive: (e.target.value as 'active' | 'inactive' | 'all') || 'active',
                      }));
                      setPage(1);
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="all">All</option>
                  </select>
                </label>
                <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                  Origin
                  <Input
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
                  <Input
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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Operator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Distance (km)</TableHead>
                  <TableHead>ETA (min)</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {pagedRoutes.map((route, idx) => {
              const operatorLabel = route.operator?.name ?? route.operatorId;
              return (
                <TableRow
                  key={route.id}
                  className={idx % 2 === 1 ? 'bg-muted/40' : undefined}
                >
                    <TableCell>{route.origin}</TableCell>
                    <TableCell>{route.destination}</TableCell>
                    <TableCell>{operatorLabel}</TableCell>
                    <TableCell>
                      {route.isActive === false ? 'Inactive' : 'Active'}
                    </TableCell>
                    <TableCell>{route.distanceKm}</TableCell>
                    <TableCell>{route.estimatedMinutes}</TableCell>
                    <TableCell>{route.notes ?? '—'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditRoute(route)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant={route.isActive === false ? 'outline' : 'destructive'}
                        onClick={() =>
                          updateMutation.mutate({
                            id: route.id,
                            data: { isActive: route.isActive === false ? true : false },
                          })
                        }
                        disabled={updateMutation.isPending}
                      >
                        {route.isActive === false ? 'Activate' : 'Deactivate'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {pagedRoutes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No routes found. Try adjusting your filters or add a new route.
                  </TableCell>
                </TableRow>
              )}
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
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
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
            <div className="flex items-center gap-2">
              {routePointsLoading && (
                <span className="text-muted-foreground text-xs">Loading…</span>
              )}
              <Button size="sm" onClick={openCreatePoint} disabled={!routePointRouteId}>
                Add point
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">
                {selectedRoute
                  ? `${selectedRoute.origin} → ${selectedRoute.destination}`
                  : 'Select a route'}
              </Badge>
              <Badge variant="outline">{routePoints.length} total points</Badge>
              <Badge variant="outline">{pickupCount} pickup</Badge>
              <Badge variant="outline">{dropoffCount} dropoff</Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1 md:col-span-2">
                Route
                <Input
                  placeholder="Search routes by name or operator"
                  value={routeOptionQuery}
                  onChange={(e) => setRouteOptionQuery(e.target.value)}
                />
                <select
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  value={routePointRouteId}
                  onChange={(e) => setRoutePointRouteId(e.target.value)}
                >
                  {routeOptionList.length === 0 && (
                    <option value="" disabled>
                      No routes match your search
                    </option>
                  )}
                  {routeOptionList.map((route) => (
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
                <Input
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
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                  setRoutePointFilters({
                    query: undefined,
                    type: undefined,
                  })
              }
            >
              Clear filters
            </Button>
          </div>
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
                        onClick={() => openEditPoint(point)}
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

      <Dialog
        open={routeModalOpen}
        onOpenChange={(open) => {
          setRouteModalOpen(open);
          if (!open) {
            setEditForm(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {routeModalMode === 'create' ? 'Create route' : 'Edit route'}
            </DialogTitle>
            <DialogDescription>
              {routeModalMode === 'create'
                ? 'Define the operator, origin, and destination to make a route available.'
                : 'Update route details to keep schedules accurate.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Operator
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={
                  routeModalMode === 'create'
                    ? createForm.operatorId
                    : editForm?.operatorId ?? ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (routeModalMode === 'create') {
                    setCreateForm((prev) => ({ ...prev, operatorId: value }));
                  } else {
                    setEditForm((prev) => (prev ? { ...prev, operatorId: value } : prev));
                  }
                }}
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
              <Input
                placeholder="Ho Chi Minh City"
                value={routeModalMode === 'create' ? createForm.origin : editForm?.origin ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (routeModalMode === 'create') {
                    setCreateForm((prev) => ({ ...prev, origin: value }));
                  } else {
                    setEditForm((prev) => (prev ? { ...prev, origin: value } : prev));
                  }
                }}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Destination
              <Input
                placeholder="Hanoi"
                value={
                  routeModalMode === 'create'
                    ? createForm.destination
                    : editForm?.destination ?? ''
                }
                onChange={(e) => {
                  const value = e.target.value;
                  if (routeModalMode === 'create') {
                    setCreateForm((prev) => ({ ...prev, destination: value }));
                  } else {
                    setEditForm((prev) => (prev ? { ...prev, destination: value } : prev));
                  }
                }}
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Distance (km)
              <Input
                type="number"
                min={0}
                placeholder="1700"
                value={
                  routeModalMode === 'create'
                    ? createForm.distanceKm
                    : editForm?.distanceKm ?? 0
                }
                onChange={(e) => {
                  const value = Number.isFinite(Number(e.target.value))
                    ? Number(e.target.value)
                    : 0;
                  if (routeModalMode === 'create') {
                    setCreateForm((prev) => ({ ...prev, distanceKm: value }));
                  } else {
                    setEditForm((prev) => (prev ? { ...prev, distanceKm: value } : prev));
                  }
                }}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              ETA (minutes)
              <Input
                type="number"
                min={0}
                placeholder="1500"
                value={
                  routeModalMode === 'create'
                    ? createForm.estimatedMinutes
                    : editForm?.estimatedMinutes ?? 0
                }
                onChange={(e) => {
                  const value = Number.isFinite(Number(e.target.value))
                    ? Number(e.target.value)
                    : 0;
                  if (routeModalMode === 'create') {
                    setCreateForm((prev) => ({ ...prev, estimatedMinutes: value }));
                  } else {
                    setEditForm((prev) =>
                      prev ? { ...prev, estimatedMinutes: value } : prev,
                    );
                  }
                }}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Notes
              <Input
                placeholder="Notes"
                value={routeModalMode === 'create' ? createForm.notes : editForm?.notes ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (routeModalMode === 'create') {
                    setCreateForm((prev) => ({ ...prev, notes: value }));
                  } else {
                    setEditForm((prev) => (prev ? { ...prev, notes: value } : prev));
                  }
                }}
              />
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRouteModalOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (routeModalMode === 'create') {
                  createMutation.mutate({
                    operatorId: createForm.operatorId,
                    origin: createForm.origin,
                    destination: createForm.destination,
                    notes: createForm.notes,
                    distanceKm: createForm.distanceKm,
                    estimatedMinutes: createForm.estimatedMinutes,
                  });
                  return;
                }
                if (!editForm) return;
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
                });
              }}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                (routeModalMode === 'create'
                  ? !createForm.operatorId || !createForm.origin || !createForm.destination
                  : !editForm?.operatorId || !editForm?.origin || !editForm?.destination)
              }
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={routePointModalOpen} onOpenChange={setRoutePointModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPointId ? 'Edit route point' : 'Add route point'}</DialogTitle>
            <DialogDescription>
              Add pickup and dropoff points to guide passengers during booking and boarding.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-6">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1 md:col-span-2">
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
              <Input
                value={routePointForm.name}
                onChange={(e) =>
                  setRoutePointForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Route point name"
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1 md:col-span-3">
              Address
              <Input
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
              <Input
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
              <Input
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
              <Input
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoutePointModalOpen(false)}
              disabled={createPointMutation.isPending || updatePointMutation.isPending}
            >
              Cancel
            </Button>
            <Button
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
              {createPointMutation.isPending || updatePointMutation.isPending
                ? 'Saving…'
                : editingPointId
                  ? 'Update point'
                  : 'Add point'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
