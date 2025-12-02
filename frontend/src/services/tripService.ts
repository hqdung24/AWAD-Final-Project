import { http } from '@/lib/http';
import type { SearchTripQuery } from '@/schemas/trips/search-trip-query.request';
import {
  TripDetailResponseSchema,
  type TripDetailData,
} from '@/schemas/trips/trip-detail.response';
import {
  TripListResponseSchema,
  type TripListData,
} from '@/schemas/trips/trip-list.response';

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

// Old admin APIs
export async function listTrips(): Promise<Trip[]> {
  const res = await http.get('/trips');
  return (res as { data: Trip[] }).data;
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

export async function updateTrip(
  id: string,
  payload: Partial<Omit<Trip, 'id'>>
): Promise<Trip> {
  const res = await http.patch(`/trips/${id}`, payload);
  return (res as { data: Trip }).data;
}

export async function deleteTrip(id: string): Promise<void> {
  await http.delete(`/trips/${id}`);
}

// New public APIs
export async function searchTrips(
  query: SearchTripQuery
): Promise<TripListData> {
  const params = new URLSearchParams();

  if (query.origin) params.append('origin', query.origin);
  if (query.destination) params.append('destination', query.destination);
  if (query.date) params.append('date', query.date);
  if (query.passengers)
    params.append('passengers', query.passengers.toString());
  if (query.minPrice) params.append('minPrice', query.minPrice.toString());
  if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString());
  if (query.timeSlots?.length)
    params.append('timeSlots', query.timeSlots.join(','));
  if (query.busTypes?.length)
    params.append('busTypes', query.busTypes.join(','));
  if (query.amenities?.length)
    params.append('amenities', query.amenities.join(','));
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.page) params.append('page', query.page.toString());
  if (query.limit) params.append('limit', query.limit.toString());

  const res = await http.get(`/trips/search?${params.toString()}`);
  const validated = TripListResponseSchema.parse(res);
  return validated.data;
}

export async function getTripDetail(id: string): Promise<TripDetailData> {
  const res = await http.get(`/trips/${id}`);
  const validated = TripDetailResponseSchema.parse(res);
  return validated.data;
}
