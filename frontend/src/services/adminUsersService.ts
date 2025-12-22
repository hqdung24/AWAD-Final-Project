import { http } from '@/lib/http';

export type AdminUser = {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt?: string;
};

export type AdminUsersResponse = {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminUsersQuery = {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export async function listAdminUsers(
  params: AdminUsersQuery,
): Promise<AdminUsersResponse> {
  const res = await http.get('/admin/users', { params });
  return (res as { data: AdminUsersResponse }).data;
}

export async function createAdminUser(payload: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
}): Promise<AdminUser> {
  const res = await http.post('/admin/users', payload);
  return (res as { data: AdminUser }).data;
}

export async function updateAdminUser(
  id: string,
  payload: Partial<{
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    role: string;
    isActive?: boolean;
  }>,
): Promise<AdminUser> {
  const res = await http.patch(`/admin/users/${id}`, payload);
  return (res as { data: AdminUser }).data;
}

export async function deactivateAdminUser(id: string): Promise<AdminUser> {
  const res = await http.patch(`/admin/users/${id}/deactivate`);
  return (res as { data: AdminUser }).data;
}
