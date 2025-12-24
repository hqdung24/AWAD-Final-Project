import { http } from '@/lib/http';

export type PassengerItem = {
  id: string;
  fullName: string;
  documentId: string;
  seatCode: string;
  checkedInAt?: string | null;
  booking?: {
    id: string;
    bookingReference?: string | null;
    status?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  trip?: {
    id: string;
    origin?: string;
    destination?: string;
    departureTime?: string;
    arrivalTime?: string;
  };
};

export async function listTripPassengers(tripId: string): Promise<PassengerItem[]> {
  const res = await http.get(`/admin/trips/${tripId}/passengers`);
  return (res as { data: PassengerItem[] }).data;
}

export async function checkInPassenger(
  tripId: string,
  passengerId: string
): Promise<{ id: string; checkedInAt: string }> {
  const res = await http.patch(`/admin/trips/${tripId}/passengers/${passengerId}/check-in`);
  return (res as { data: { id: string; checkedInAt: string } }).data;
}

export async function resetPassengerCheckIn(
  tripId: string,
  passengerId: string
): Promise<{ id: string; checkedInAt: string | null }> {
  const res = await http.patch(
    `/admin/trips/${tripId}/passengers/${passengerId}/check-in/reset`
  );
  return (res as { data: { id: string; checkedInAt: string | null } }).data;
}
