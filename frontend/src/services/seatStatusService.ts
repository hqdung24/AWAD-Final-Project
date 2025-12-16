import { http } from '@/lib/http';

export type SeatStatusItem = {
  id: string;
  seatId: string;
  seatCode?: string;
  state: string;
};

export async function getSeatStatusesByTrip(
  tripId: string,
): Promise<SeatStatusItem[]> {
  const res = await http.get(`/seat-status/trip/${tripId}`);
  // Backend returns raw entities; map minimal fields
  const data = (res as { data: any[] }).data ?? [];
  return data.map((item) => ({
    id: item.id,
    seatId: item.seatId,
    seatCode: item.seat?.seatCode ?? item.seatCode,
    state: item.state,
  }));
}
