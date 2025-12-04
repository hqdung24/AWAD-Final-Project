import { http } from '@/lib/http';

export interface SearchTrip {
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
  busModel: string;
  plateNumber: string;
}

export interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
  passengers?: number;
}

export async function searchTrips(params: SearchParams): Promise<SearchTrip[]> {
  const queryParams = new URLSearchParams();
  
  if (params.from) queryParams.append('from', params.from);
  if (params.to) queryParams.append('to', params.to);
  if (params.date) queryParams.append('date', params.date);
  if (params.passengers) queryParams.append('passengers', params.passengers.toString());

  const response = await http.get(`/trips/search?${queryParams.toString()}`);
  console.log('🚀 searchTrips response:', response.data);

  return response.data;
}
