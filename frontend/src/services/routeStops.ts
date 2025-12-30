import { http } from '@/lib/http';

export type RouteStop = {
  id?: string;
  name: string;
  type: 'pickup' | 'dropoff';
  order?: number;
  note?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  orderIndex?: number;
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

export type RoutePointPayload = {
  type: 'pickup' | 'dropoff';
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  orderIndex?: number;
};

export async function listRoutePoints(routeId: string): Promise<RouteStop[]> {
  const res = await http.get(`/admin/routes/${routeId}/points`);
  return (res as { data: RouteStop[] }).data;
}

export async function createRoutePoint(
  routeId: string,
  payload: RoutePointPayload,
): Promise<RouteStop> {
  const res = await http.post(`/admin/routes/${routeId}/points`, payload);
  return (res as { data: RouteStop }).data;
}

export async function updateRoutePoint(
  pointId: string,
  payload: Partial<RoutePointPayload>,
): Promise<RouteStop> {
  const res = await http.patch(`/admin/route-points/${pointId}`, payload);
  return (res as { data: RouteStop }).data;
}

export async function deleteRoutePoint(pointId: string): Promise<void> {
  await http.delete(`/admin/route-points/${pointId}`);
}
