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
  basePrice: number;
  status?: string;
};

export type Bus = {
  id: string;
  name: string;
  capacity: number;
  seatLayout?: string;
};

export type TripListResponse = {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function listTrips(): Promise<TripListResponse> {
  const res = await http.get('/admin/trips');
  return (res as { data: TripListResponse }).data;
}

export async function listBuses(): Promise<Bus[]> {
  // Buses are exposed under the bus controller
  const res = await http.get('/bus');
  return (res as { data: Bus[] }).data;
}

export async function createTrip(payload: Omit<Trip, 'id'>): Promise<Trip> {
  const res = await http.post('/admin/trips', payload);
  return (res as { data: Trip }).data;
}

export async function updateTrip(id: string, payload: Partial<Omit<Trip, 'id'>>): Promise<Trip> {
  const res = await http.patch(`/admin/trips/${id}`, payload);
  return (res as { data: Trip }).data;
}

export async function deleteTrip(id: string): Promise<void> {
  await http.delete(`/admin/trips/${id}`);
}

export interface TripDetails {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  busType: string;
  company: string;
  amenities: string[];
  seatsAvailable: number;
  busModel?: string;
  plateNumber?: string;
  distanceKm?: number;
  routePoints?: {
    pickup: Array<{ name: string; address?: string; note?: string }>;
    dropoff: Array<{ name: string; address?: string; note?: string }>;
  };
}

export async function getTripDetails(id: string): Promise<TripDetails> {
  const res = await http.get(`/trips/${id}`);
  return (res as { data: TripDetails }).data;
}
