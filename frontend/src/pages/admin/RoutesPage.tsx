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
  createAdminRoute,
  updateAdminRoute,
  deleteAdminRoute,
  type AdminRoute,
} from '@/services/adminRoutesService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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

  const {
    data: adminRoutes = [],
    isLoading: routesLoading,
  } = useQuery<AdminRoute[]>({
    queryKey: ['admin-routes'],
    queryFn: listAdminRoutes,
  });

  const createMutation = useMutation({
    mutationFn: createAdminRoute,
    onSuccess: () => {
      setCreateForm(initialRouteForm);
      void qc.invalidateQueries({ queryKey: ['admin-routes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Omit<AdminRoute, 'id'>> }) =>
      updateAdminRoute(payload.id, payload.data),
    onSuccess: () => {
      setEditForm(null);
      void qc.invalidateQueries({ queryKey: ['admin-routes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminRoute,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-routes'] });
    },
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Manage Routes (mock now, DB-ready later)</span>
            {routesLoading && (
              <span className="text-muted-foreground text-xs">Loading…</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
                Operator ID (uuid)
                <input
                  className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                  placeholder="0000-...-0001"
                  value={createForm.operatorId}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      operatorId: e.target.value,
                    }))
                  }
                />
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
              {adminRoutes.map((route) => {
                const isEditing = editForm?.id === route.id;
                return (
                  <TableRow key={route.id}>
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
                        <input
                          className="border-input bg-background text-sm px-2 py-1 rounded-md border w-full"
                          value={editForm?.operatorId ?? ''}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev
                                ? { ...prev, operatorId: e.target.value }
                                : prev,
                            )
                          }
                        />
                      ) : (
                        route.operatorId
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
        </CardContent>
      </Card>
    </div>
  );
}
