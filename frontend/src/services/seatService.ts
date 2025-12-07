import { http } from '@/lib/http';

export interface SeatStatus {
  id: string;
  tripId: string;
  seatId: string;
  state: 'available' | 'locked' | 'booked';
  bookingId?: string;
  lockedUntil?: string;
  seat: {
    id: string;
    seatCode: string;
    seatType: string;
    isActive: boolean;
  };
}

export interface LockSeatsRequest {
  trip_id: string;
  seat_ids: string[];
}

export interface LockSeatsSuccessResponse {
  success: true;
  trip_id: string;
  seat_ids: string[];
  locked_until: string;
  lock_token: string;
}

export interface LockSeatsErrorResponse {
  success: false;
  error: string;
  message?: string;
  seat?: string;
  locked_until?: string;
}

export type LockSeatsResponse =
  | LockSeatsSuccessResponse
  | LockSeatsErrorResponse;

export async function getSeatsByTrip(tripId: string): Promise<SeatStatus[]> {
  const res = await http.get(`/seat-status/trip/${tripId}`);
  return (res as { data: SeatStatus[] }).data;
}

export async function lockSeats(
  tripId: string,
  seatIds: string[]
): Promise<LockSeatsResponse> {
  try {
    const response = (await http.post('/seat-status/lock', {
      tripId,
      seatIds,
    })) as any;

    console.log('Lock seats response:', response);

    // Backend wraps response in {data: {...}}, so we need to unwrap it
    const actualData = response.data || response;

    // Check if response has success property
    if ('success' in actualData && actualData.success === true) {
      return actualData as LockSeatsSuccessResponse;
    }

    // If response doesn't have success or it's false, return as error
    console.log('Response does not have success=true, treating as error');
    return actualData as LockSeatsErrorResponse;
  } catch (error: any) {
    console.error('Lock seats error:', error);

    // Check if error response has specific error details
    if (error?.response?.data) {
      const errorData = error.response.data;

      // If backend returned structured error
      if (errorData.success === false) {
        return errorData as LockSeatsErrorResponse;
      }

      // If backend returned validation error or other error format
      return {
        success: false,
        error: errorData.error || 'LOCK_FAILED',
        message: errorData.message || JSON.stringify(errorData),
      };
    }

    // Network or other errors
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: error?.message || 'Failed to lock seats. Please try again.',
    };
  }
}
