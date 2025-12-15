import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
          <CardTitle>{editingId ? 'Edit Operator' : 'Add Operator'}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input
            placeholder="Name"
            value={form.name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            placeholder="Contact Email"
            value={form.contactEmail ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))}
          />
          <Input
            placeholder="Contact Phone"
            value={form.contactPhone ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
          />
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
          <div className="flex gap-2">
            <Button onClick={onSubmit} disabled={createMut.isPending || updateMut.isPending} className="flex-1">
              {editingId ? 'Update' : 'Create'}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', contactEmail: '', contactPhone: '', status: 'active' });
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
          <CardTitle>Operator Directory</CardTitle>
        </CardHeader>
        <CardContent>
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
              {operators.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-medium">{op.name}</TableCell>
                  <TableCell>{op.contactEmail ?? '—'}</TableCell>
                  <TableCell>{op.contactPhone ?? '—'}</TableCell>
                  <TableCell>{op.status ?? '—'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(op.id);
                        setForm({
                          name: op.name,
                          contactEmail: op.contactEmail,
                          contactPhone: op.contactPhone,
                          status: op.status ?? 'active',
                        });
                      }}
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
              {!operators.length && !isLoading && (
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
    </div>
  );
};

export default OperatorsPage;
