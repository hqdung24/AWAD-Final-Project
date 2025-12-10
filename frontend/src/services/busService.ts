import { http } from '@/lib/http';

export type Bus = {
  id: string;
  operatorId: string;
  name?: string;
  operator?: {
    id: string;
    name: string;
  };
  plateNumber: string;
  model: string;
  busType?: string;
  seatCapacity: number;
  amenitiesJson?: string;
};

export type Seat = {
  id: string;
  seatCode: string;
  seatType: string;
  isActive: boolean;
};

export type BusAssignment = {
  id: string;
  busId: string;
  routeId: string;
  startTime: string;
  endTime: string;
};

export async function listBuses(params?: { page?: number; limit?: number; operatorId?: string }): Promise<Bus[]> {
  const res = await http.get('/admin/buses', { params });
  const payload = (res as any)?.data ?? res;
  return Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
}

export async function createBus(payload: Omit<Bus, 'id'>): Promise<Bus> {
  const res = await http.post('/admin/buses', payload);
  return (res as { data: Bus }).data;
}

export async function updateBus(
  id: string,
  payload: Partial<Omit<Bus, 'id'>>
): Promise<Bus> {
  const res = await http.patch(`/admin/buses/${id}`, payload);
  return (res as { data: Bus }).data;
}

export async function deleteBus(id: string): Promise<void> {
  await http.delete(`/admin/buses/${id}`);
}

export async function listSeats(busId: string): Promise<Seat[]> {
  const res = await http.get(`/admin/buses/${busId}/seats`);
  return (res as { data: Seat[] }).data;
}

export async function createSeat(
  busId: string,
  payload: Omit<Seat, 'id' | 'isActive'> & { isActive?: boolean }
): Promise<Seat> {
  const res = await http.post(`/admin/buses/${busId}/seats`, payload);
  return (res as { data: Seat }).data;
}

export async function updateSeat(
  busId: string,
  id: string,
  payload: Partial<Omit<Seat, 'id'>>
): Promise<Seat> {
  const res = await http.patch(`/admin/buses/${busId}/seats/${id}`, payload);
  return (res as { data: Seat }).data;
}

export async function deleteSeat(id: string): Promise<void> {
  await http.delete(`/admin/seats/${id}`);
}
