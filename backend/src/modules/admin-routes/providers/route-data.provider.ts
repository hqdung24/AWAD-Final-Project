export type RouteRecord = {
  id: string;
  operatorId: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedMinutes: number;
  notes?: string;
};

export const ROUTE_DATA_PROVIDER = 'ROUTE_DATA_PROVIDER';

export interface RouteDataProvider {
  list(): Promise<RouteRecord[]>;
  findById(id: string): Promise<RouteRecord | undefined>;
  create(payload: Omit<RouteRecord, 'id'>): Promise<RouteRecord>;
  update(id: string, payload: Partial<Omit<RouteRecord, 'id'>>): Promise<RouteRecord>;
  delete(id: string): Promise<void>;
}
