export type StopRecord = {
  id: string;
  name: string;
  type: 'pickup' | 'dropoff';
  order: number;
  note?: string;
};

export type TripRecord = {
  id: string;
  routeId: string;
  busId: string;
  departureTime: string; // ISO string
  arrivalTime: string; // ISO string
  basePrice: number;
  status?: string;
};

export type BusRecord = {
  id: string;
  name: string;
  capacity: number;
  seatLayout?: string;
};

export const TRIP_DATA_PROVIDER = 'TRIP_DATA_PROVIDER';

export interface TripDataProvider {
  listTrips(): Promise<TripRecord[]>;
  listBuses(): Promise<BusRecord[]>;
  findTrip(id: string): Promise<TripRecord | undefined>;
  createTrip(payload: Omit<TripRecord, 'id'>): Promise<TripRecord>;
  updateTrip(id: string, payload: Partial<Omit<TripRecord, 'id'>>): Promise<TripRecord>;
  deleteTrip(id: string): Promise<void>;
}
