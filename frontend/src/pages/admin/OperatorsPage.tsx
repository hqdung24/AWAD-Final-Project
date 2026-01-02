import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  listOperators,
  createOperator,
  updateOperator,
  deleteOperator,
  type Operator,
} from '@/services/operatorService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { notify } from '@/lib/notify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const OperatorsPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Operator>>({
    name: '',
    contactEmail: '',
    contactPhone: '',
    status: 'active',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { data, error, isLoading } = useQuery<Operator[]>({
    queryKey: ['operators'],
    queryFn: listOperators,
    retry: false,
  });

  const createMut = useMutation({
    mutationFn: createOperator,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['operators'] });
      setForm({ name: '', contactEmail: '', contactPhone: '', status: 'active' });
    },
    onError: (err: any) => {
      notify.error(err?.message ?? 'Failed to create operator');
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: string; data: Partial<Operator> }) =>
      updateOperator(payload.id, payload.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['operators'] });
      setEditingId(null);
      setForm({ name: '', contactEmail: '', contactPhone: '', status: 'active' });
    },
    onError: (err: any) => {
      notify.error(err?.message ?? 'Failed to update operator');
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteOperator,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['operators'] }),
    onError: (err: any) => notify.error(err?.message ?? 'Failed to delete operator'),
  });

  const onSubmit = () => {
    if (!form.name || !form.contactEmail || !form.contactPhone || !form.status) {
      notify.error('Please fill all required fields');
      return;
    }
    if (editingId) {
      updateMut.mutate({ id: editingId, data: form });
    } else {
      // omit id
      const { name, contactEmail, contactPhone, status } = form;
      createMut.mutate({
        name: name as string,
        contactEmail: contactEmail as string,
        contactPhone: contactPhone as string,
        status: status as string,
      });
    }
  };

  const operators = data ?? [];
  const filteredOperators = operators.filter((op) => {
    if (!query) return true;
    const q = query.toLowerCase();
    const hay = `${op.name ?? ''} ${op.contactEmail ?? ''} ${op.contactPhone ?? ''}`.toLowerCase();
    return hay.includes(q);
  });
  const activeCount = filteredOperators.filter((op) => op.status === 'active').length;
  const pendingCount = filteredOperators.filter((op) => op.status === 'pending').length;

  const openCreateOperator = () => {
    setEditingId(null);
    setForm({ name: '', contactEmail: '', contactPhone: '', status: 'active' });
    setModalOpen(true);
  };

  const openEditOperator = (op: Operator) => {
    setEditingId(op.id);
    setForm({
      name: op.name,
      contactEmail: op.contactEmail,
      contactPhone: op.contactPhone,
      status: op.status ?? 'active',
    });
    setModalOpen(true);
  };

  if (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isForbidden = (error as any)?.status === 403;
    if (isForbidden) navigate('/403');
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="space-y-1">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight">Operators</h1>
        <p className="text-muted-foreground text-sm">
          Manage bus operators connected to the platform.
        </p>
        {isLoading && (
          <p className="text-xs text-muted-foreground">Loading operators…</p>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Operator Directory</span>
            <Button size="sm" onClick={openCreateOperator}>
              New operator
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{filteredOperators.length} operators</Badge>
            <Badge variant="outline">{activeCount} active</Badge>
            <Badge variant="outline">{pendingCount} pending</Badge>
          </div>
          <Separator />
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[220px]">
              <Input
                placeholder="Search by name, email, or phone"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setQuery('')}
              disabled={!query}
            >
              Clear
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact Email</TableHead>
                <TableHead>Contact Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperators.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.name}</TableCell>
                  <TableCell>{op.contactEmail ?? '—'}</TableCell>
                  <TableCell>{op.contactPhone ?? '—'}</TableCell>
                  <TableCell>{op.status ?? '—'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditOperator(op)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMut.mutate(op.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredOperators.length && !isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No operators found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setEditingId(null);
            setForm({ name: '', contactEmail: '', contactPhone: '', status: 'active' });
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Operator' : 'Add Operator'}</DialogTitle>
            <DialogDescription>
              Set the operator contact details and status to keep the fleet organized.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Name
              <Input
                placeholder="Operator name"
                value={form.name ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Status
              <Select
                value={form.status ?? 'active'}
                onValueChange={(val) => setForm((f) => ({ ...f, status: val }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Contact Email
              <Input
                placeholder="email@operator.com"
                value={form.contactEmail ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
              />
            </label>
            <label className="text-xs font-medium text-muted-foreground flex flex-col gap-1">
              Contact Phone
              <Input
                placeholder="090-000-0000"
                value={form.contactPhone ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
              />
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={createMut.isPending || updateMut.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={createMut.isPending || updateMut.isPending}
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperatorsPage;
