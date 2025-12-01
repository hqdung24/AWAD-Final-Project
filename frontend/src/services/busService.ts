import { http } from '@/lib/http';

export type Bus = {
  id: string;
  operatorId: string;
  name: string;
  plateNumber: string;
  model?: string;
  seatCapacity: number;
  seatMetaJson?: string;
};

export type BusAssignment = {
  id: string;
  busId: string;
  routeId: string;
  startTime: string;
  endTime: string;
};

export type Seat = {
  id?: string;
  seatCode: string;
  seatType: string;
  isActive: boolean;
  price?: number;
};

export async function listBuses(): Promise<Bus[]> {
  const res = await http.get('/buses');
  return (res as { data: Bus[] }).data;
}

export async function createBus(payload: Omit<Bus, 'id'>): Promise<Bus> {
  const res = await http.post('/buses', payload);
  return (res as { data: Bus }).data;
}

export async function updateBus(
  id: string,
  payload: Partial<Omit<Bus, 'id'>>,
): Promise<Bus> {
  const res = await http.patch(`/buses/${id}`, payload);
  return (res as { data: Bus }).data;
}

export async function deleteBus(id: string): Promise<void> {
  await http.delete(`/buses/${id}`);
}

export async function listAssignments(busId?: string): Promise<BusAssignment[]> {
  const url = busId ? `/buses/assignments/all?busId=${busId}` : '/buses/assignments/all';
  const res = await http.get(url);
  return (res as { data: BusAssignment[] }).data;
}

export async function assignBus(
  busId: string,
  payload: Omit<BusAssignment, 'id' | 'busId'>,
): Promise<BusAssignment> {
  const res = await http.post(`/buses/${busId}/assign`, payload);
  return (res as { data: BusAssignment }).data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await http.delete(`/buses/assignments/${id}`);
}

export async function getSeatMap(busId: string): Promise<Seat[]> {
  const res = await http.get(`/buses/${busId}/seat-map`);
  return (res as { data: Seat[] }).data;
}

export async function updateSeatMap(busId: string, seats: Seat[]): Promise<Seat[]> {
  const res = await http.patch(`/buses/${busId}/seat-map`, { seats });
  return (res as { data: Seat[] }).data;
}
