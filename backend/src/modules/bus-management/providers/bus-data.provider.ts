export type BusRecord = {
  id: string;
  operatorId: string;
  name: string;
  plateNumber: string;
  model?: string;
  seatCapacity: number;
  seatMetaJson?: string;
};

export type BusAssignmentRecord = {
  id: string;
  busId: string;
  routeId: string;
  startTime: string; // ISO
  endTime: string; // ISO
};

export type SeatRecord = {
  id: string;
  seatCode: string;
  seatType: string;
  isActive: boolean;
  price?: number;
};

export const BUS_DATA_PROVIDER = 'BUS_DATA_PROVIDER';

export interface BusDataProvider {
  listBuses(): Promise<BusRecord[]>;
  createBus(payload: Omit<BusRecord, 'id'>): Promise<BusRecord>;
  updateBus(id: string, payload: Partial<Omit<BusRecord, 'id'>>): Promise<BusRecord>;
  deleteBus(id: string): Promise<void>;
  listAssignments(busId?: string): Promise<BusAssignmentRecord[]>;
  assignBus(payload: Omit<BusAssignmentRecord, 'id'>): Promise<BusAssignmentRecord>;
  deleteAssignment(id: string): Promise<void>;
  getSeatMap(busId: string): Promise<SeatRecord[]>;
  updateSeatMap(busId: string, seats: SeatRecord[]): Promise<SeatRecord[]>;
}
