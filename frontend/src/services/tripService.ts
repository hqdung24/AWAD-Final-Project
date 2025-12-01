import { http } from '@/lib/http';

export type Stop = {
  id?: string;
  name: string;
  type: 'pickup' | 'dropoff';
  order: number;
  note?: string;
};

export type Trip = {
  id: string;
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  seatLayout?: string;
  status?: string;
  stops: Stop[];
};

export type Bus = {
  id: string;
  name: string;
  capacity: number;
  seatLayout?: string;
};

export async function listTrips(): Promise<Trip[]> {
  const res = await http.get('/trips');
  return (res as { data: Trip[] }).data;
}

export async function listBuses(): Promise<Bus[]> {
  const res = await http.get('/trips/buses');
  return (res as { data: Bus[] }).data;
}

export async function createTrip(payload: Omit<Trip, 'id'>): Promise<Trip> {
  const res = await http.post('/trips', payload);
  return (res as { data: Trip }).data;
}

export async function updateTrip(id: string, payload: Partial<Omit<Trip, 'id'>>): Promise<Trip> {
  const res = await http.patch(`/trips/${id}`, payload);
  return (res as { data: Trip }).data;
}

export async function deleteTrip(id: string): Promise<void> {
  await http.delete(`/trips/${id}`);
}
