import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { searchTrips, getTripDetail } from '@/services/tripService';
import type { SearchTripQuery } from '@/schemas/trips/search-trip-query.request';
import type { TripListData, TripDetailData } from '@/schemas/trips';

/**
 * Hook to search trips with filters
 * @param query - Search query parameters
 * @param enabled - Enable/disable the query (default: true)
 */
export function useSearchTrips(
  query: SearchTripQuery,
  enabled: boolean = true
): UseQueryResult<TripListData, Error> {
  return useQuery({
    queryKey: ['trips', 'search', query],
    queryFn: () => searchTrips(query),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get trip detail by ID
 * @param id - Trip ID
 * @param enabled - Enable/disable the query (default: true when id exists)
 */
export function useTripDetail(
  id: string | undefined,
  enabled: boolean = true
): UseQueryResult<TripDetailData, Error> {
  return useQuery({
    queryKey: ['trips', 'detail', id],
    queryFn: () => getTripDetail(id!),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
