import { http } from '@/lib/http';

export type Operator = {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: string;
};

export async function listOperators(): Promise<Operator[]> {
  const res = await http.get('/admin/operators');
  return (res as { data: Operator[] }).data;
}

export async function createOperator(
  payload: Omit<Operator, 'id'>,
): Promise<Operator> {
  const res = await http.post('/admin/operators', payload);
  return (res as { data: Operator }).data;
}

export async function updateOperator(
  id: string,
  payload: Partial<Omit<Operator, 'id'>>,
): Promise<Operator> {
  const res = await http.patch(`/admin/operators/${id}`, payload);
  return (res as { data: Operator }).data;
}

export async function deleteOperator(id: string): Promise<void> {
  await http.delete(`/admin/operators/${id}`);
}
