import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRelatedTrips } from '@/services/tripService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bus,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';

interface RelatedTripsProps {
  currentTripId: string;
}

export function RelatedTrips({ currentTripId }: RelatedTripsProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1';

  const { data: relatedTrips, isLoading } = useQuery({
    queryKey: ['related-trips', currentTripId],
    queryFn: () => getRelatedTrips(currentTripId),
    enabled: !!currentTripId,
  });

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleTripClick = (tripId: string) => {
    navigate(
      `/search/${tripId}?from=${from}&to=${to}&date=${date}&passengers=${passengers}`
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Similar Trips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 rounded-lg border bg-muted/50 animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!relatedTrips || relatedTrips.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Similar Trips You May Like
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Other trips on the same route with similar schedules and prices
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {relatedTrips.map((trip) => (
            <Card
              key={trip.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTripClick(trip.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Left: Time & Route */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {formatTime(trip.departureTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(trip.departureTime)}
                        </div>
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 border-t-2 border-dashed" />
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {trip.duration}
                        </Badge>
                        <div className="flex-1 border-t-2 border-dashed" />
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {formatTime(trip.arrivalTime)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(trip.arrivalTime)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {trip.from} → {trip.to}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Bus Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{trip.company}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{trip.busType}</Badge>
                      {trip.seatsAvailable > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {trip.seatsAvailable} seats
                        </Badge>
                      )}
                    </div>
                    {trip.amenities && trip.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {trip.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded"
                          >
                            {amenity.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: Price & Action */}
                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-3 md:text-right">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(trip.price)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per seat
                      </div>
                    </div>
                    <Button size="sm" className="shrink-0">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
