import { http } from '@/lib/http';

export type AdminRoute = {
  id: string;
  operatorId: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedMinutes: number;
  notes?: string;
};

export async function listAdminRoutes(): Promise<AdminRoute[]> {
  const res = await http.get('/admin/routes');
  return (res as { data: AdminRoute[] }).data;
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
