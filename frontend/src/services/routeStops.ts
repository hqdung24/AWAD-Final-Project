import { http } from '@/lib/http';

export type RouteStop = {
  id?: string;
  name: string;
  type: 'pickup' | 'dropoff';
  order: number;
  note?: string;
};

export type RouteWithStops = {
  id: string;
  operatorId: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedMinutes: number;
  notes?: string;
  stops?: RouteStop[];
};

export async function listRoutesWithStops(): Promise<RouteWithStops[]> {
  const res = await http.get('/routes');
  return (res as { data: RouteWithStops[] }).data;
}
