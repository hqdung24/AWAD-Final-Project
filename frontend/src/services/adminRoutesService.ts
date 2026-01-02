import { http } from '@/lib/http';

export type AdminRoute = {
  id: string;
  operatorId?: string;
  operator?: {
    id: string;
    name: string;
    contactEmail?: string;
    contactPhone?: string;
    status?: string;
  };
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedMinutes: number;
  notes?: string;
  isActive?: boolean;
};

export async function listAdminRoutes(params?: {
  operatorId?: string;
  isActive?: boolean;
}): Promise<AdminRoute[]> {
  const query: Record<string, string> = {};
  if (params?.operatorId) query.operatorId = params.operatorId;
  if (params?.isActive !== undefined) query.isActive = String(params.isActive);
  const res = await http.get('/admin/routes', { params: query });
  return (res as { data: AdminRoute[] }).data;
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

export async function createAdminRoute(
  payload: Omit<AdminRoute, 'id'>,
): Promise<AdminRoute> {
  const res = await http.post('/admin/routes', payload);
  return (res as { data: AdminRoute }).data;
}

export async function updateAdminRoute(
  id: string,
  payload: Partial<Omit<AdminRoute, 'id'>>,
): Promise<AdminRoute> {
  const res = await http.patch(`/admin/routes/${id}`, payload);
  return (res as { data: AdminRoute }).data;
}

export async function deleteAdminRoute(id: string): Promise<void> {
  await http.delete(`/admin/routes/${id}`);
}
