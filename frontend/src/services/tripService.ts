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
  operatorId: string;
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

export type TripListResponse = {
  data: Trip[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type TripListParams = {
  page?: number;
  limit?: number;
  status?: string;
  routeId?: string;
  busId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function listTrips(params?: TripListParams): Promise<TripListResponse> {
  const res = (await http.get('/trips/admin', { params })) as any;
  const payload = res?.data ?? res ?? {};

  return {
    data: Array.isArray(payload.data) ? payload.data : [],
    total: Number.isFinite(Number(payload.total)) ? Number(payload.total) : 0,
    page: Number.isFinite(Number(payload.page)) ? Number(payload.page) : 1,
    limit: Number.isFinite(Number(payload.limit)) ? Number(payload.limit) : 10,
    totalPages: Number.isFinite(Number(payload.totalPages))
      ? Number(payload.totalPages)
      : 0,
  };
}

export async function listBuses(): Promise<Bus[]> {
  const res = await http.get('/admin/buses');
  return (res as { data: Bus[] }).data;
}

export async function createTrip(payload: Omit<Trip, 'id'>): Promise<Trip> {
  const res = await http.post('/trips/admin', payload);
  return (res as { data: Trip }).data;
}

export async function updateTrip(id: string, payload: Partial<Omit<Trip, 'id'>>): Promise<Trip> {
  const res = await http.patch(`/trips/admin/${id}`, payload);
  return (res as { data: Trip }).data;
}

export async function deleteTrip(id: string): Promise<void> {
  // Backend supports cancelling a trip via PATCH /trips/admin/:id/cancel
  await http.patch(`/trips/admin/${id}/cancel`, {});
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
  busPhotos?: string[];
  routePoints?: {
    pickup: Array<{ name: string; address?: string; note?: string }>;
    dropoff: Array<{ name: string; address?: string; note?: string }>;
  };
}

export async function getTripDetails(id: string): Promise<TripDetails> {
  const res = await http.get(`/trips/${id}`);
  return (res as { data: TripDetails }).data;
}
