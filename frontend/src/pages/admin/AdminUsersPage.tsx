import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import {
  createAdminUser,
  deactivateAdminUser,
  listAdminUsers,
  updateAdminUser,
  type AdminUser,
} from '@/services/adminUsersService';
import { notify } from '@/lib/notify';

const initialForm: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
} = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'ADMIN',
  isActive: true,
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    search?: string;
    role?: string;
    isActive?: string;
  }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-users', filters, page, pageSize],
    queryFn: () =>
      listAdminUsers({
        search: filters.search || undefined,
        role: filters.role || undefined,
        isActive:
          filters.isActive === 'active'
            ? true
            : filters.isActive === 'inactive'
            ? false
            : undefined,
        page,
        limit: pageSize,
      }),
  });

  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isForbidden = (error as any)?.status === 403;
    if (isForbidden) navigate('/403');
  }

  const createMut = useMutation({
    mutationFn: createAdminUser,
    onSuccess: () => {
      setForm(initialForm);
      void qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to create admin';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: string; data: Partial<AdminUser> & { password?: string } }) =>
      updateAdminUser(payload.id, payload.data),
    onSuccess: () => {
      setEditingId(null);
      setForm(initialForm);
      void qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to update admin';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const deactivateMut = useMutation({
    mutationFn: deactivateAdminUser,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to deactivate admin';
      notify.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const onSubmit = () => {
    if (!form.firstName || !form.email || (!editingId && !form.password)) {
      notify.error('Please fill required fields');
      return;
    }

    if (editingId) {
      const payload: Partial<AdminUser> & { password?: string } = {
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        email: form.email,
        role: form.role,
        isActive: form.isActive,
      };
      if (form.password) {
        payload.password = form.password;
      }
      updateMut.mutate({ id: editingId, data: payload });
    } else {
      createMut.mutate({
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        email: form.email,
        password: form.password,
        role: form.role,
        isActive: form.isActive,
      });
    }
  };

  const admins = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight">Admin Accounts</h1>
        <p className="text-muted-foreground text-sm">
          Create and manage admin or moderator accounts.
        </p>
        {isLoading && <p className="text-xs text-muted-foreground">Loading admins…</p>}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Admin' : 'Create Admin'}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-6">
          <Input
            placeholder="First name"
            value={form.firstName}
            onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
          />
          <Input
            placeholder="Last name"
            value={form.lastName}
            onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
          />
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            placeholder={editingId ? 'New password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
            Role
            <select
              className="border-input bg-background text-sm px-3 py-2 rounded-md border"
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="ADMIN">Admin</option>
              <option value="MODERATOR">Moderator</option>
            </select>
          </label>
          <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
            Status
            <select
              className="border-input bg-background text-sm px-3 py-2 rounded-md border"
              value={form.isActive ? 'active' : 'inactive'}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.value === 'active' }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="flex gap-2 md:col-span-6">
            <Button
              onClick={onSubmit}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-4">
            <Input
              placeholder="Search name or email"
              value={filters.search ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value || undefined }))
              }
            />
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Role
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={filters.role ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, role: e.target.value || undefined }))
                }
              >
                <option value="">All roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MODERATOR">Moderator</option>
              </select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Status
              <select
                className="border-input bg-background text-sm px-3 py-2 rounded-md border"
                value={filters.isActive ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, isActive: e.target.value || undefined }))
                }
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setPage(1);
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin, idx) => (
                  <TableRow key={admin.id} className={idx % 2 === 1 ? 'bg-muted/40' : undefined}>
                    <TableCell className="font-medium">
                      {admin.firstName} {admin.lastName ?? ''}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>{admin.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>
                      {admin.createdAt ? admin.createdAt.slice(0, 10) : '—'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(admin.id);
                          setForm({
                            firstName: admin.firstName,
                            lastName: admin.lastName ?? '',
                            email: admin.email,
                            password: '',
                            role: admin.role ?? 'ADMIN',
                            isActive: admin.isActive ?? true,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deactivateMut.mutate(admin.id)}
                        disabled={deactivateMut.isPending || !admin.isActive}
                      >
                        Deactivate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No admin accounts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
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
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
