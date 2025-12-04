import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bus,
  Clock,
  MapPin,
  Wifi,
  Snowflake,
  Coffee,
  Armchair,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Users,
  Phone,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { getTripDetails } from '@/services/tripService';
import { notify } from '@/lib/notify';
import { useEffect } from 'react';

export default function TripDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1';

  const { data: trip, isLoading, error } = useQuery({
    queryKey: ['trip-details', id],
    queryFn: () => getTripDetails(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      notify.error('Failed to load trip details. Please try again.');
    }
  }, [error]);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const amenitiesMap = {
    wifi: { icon: Wifi, label: 'WiFi', description: 'Free WiFi on board' },
    air_conditioning: { icon: Snowflake, label: 'Air Conditioning', description: 'Climate controlled cabin' },
    water: { icon: Coffee, label: 'Water', description: 'Complimentary water' },
    blanket: { icon: Armchair, label: 'Blanket', description: 'Blanket and pillow provided' },
  };

  const handleBookNow = () => {
    // TODO: Navigate to booking page
    notify.success('Booking feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Bus className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Loading trip details...</h3>
              <p className="text-muted-foreground">Please wait</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
              <h3 className="text-lg font-semibold mb-2">Trip not found</h3>
              <p className="text-muted-foreground mb-4">The trip you're looking for doesn't exist</p>
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/search?from=${from}&to=${to}&date=${date}&passengers=${passengers}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Search Results
        </Button>

        {/* Trip Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl mb-2">
                  {trip.from} → {trip.to}
                </CardTitle>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(trip.departureTime)}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-3xl font-bold text-primary mb-1">{formatPrice(trip.price)}</p>
                <p className="text-sm text-muted-foreground">per passenger</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trip Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Journey Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Journey Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Departure */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-primary" />
                      <div className="w-0.5 h-full bg-border mt-2" />
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">Departure</Badge>
                        <span className="text-2xl font-bold">{formatTime(trip.departureTime)}</span>
                      </div>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {trip.from}
                      </p>
                      {trip.routePoints && trip.routePoints.pickup && trip.routePoints.pickup.length > 0 && (
                        <div className="mt-3 ml-6">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Pickup Points:</p>
                          <ul className="space-y-1">
                            {trip.routePoints.pickup.map((point, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{point.name} {point.note && `(${point.note})`}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-primary bg-background" />
                      <div className="w-0.5 h-full bg-border mt-2" />
                    </div>
                    <div className="flex-1 pb-6">
                      <Badge variant="secondary" className="mb-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {trip.duration}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Travel time • {trip.distanceKm ? `${trip.distanceKm} km` : 'Distance varies'}
                      </p>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-success" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="border-success text-success">Arrival</Badge>
                        <span className="text-2xl font-bold">{formatTime(trip.arrivalTime)}</span>
                      </div>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {trip.to}
                      </p>
                      {trip.routePoints && trip.routePoints.dropoff && trip.routePoints.dropoff.length > 0 && (
                        <div className="mt-3 ml-6">
                          <p className="text-sm font-medium text-muted-foreground mb-2">Drop-off Points:</p>
                          <ul className="space-y-1">
                            {trip.routePoints.dropoff.map((point, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                                <span>{point.name} {point.note && `(${point.note})`}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bus Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5" />
                  Bus Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Operator</p>
                    <p className="font-semibold">{trip.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bus Type</p>
                    <Badge variant="secondary">{trip.busType}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bus Model</p>
                    <p className="font-semibold">{trip.busModel || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plate Number</p>
                    <p className="font-semibold font-mono">{trip.plateNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Available Seats</p>
                    <p className="font-semibold text-success">{trip.seatsAvailable} seats</p>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Amenities & Features
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trip.amenities && trip.amenities.length > 0 ? (
                      trip.amenities.map((amenity) => {
                        const amenityInfo = amenitiesMap[amenity as keyof typeof amenitiesMap];
                        if (!amenityInfo) return null;
                        const Icon = amenityInfo.icon;
                        return (
                          <div key={amenity} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                            <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">{amenityInfo.label}</p>
                              <p className="text-sm text-muted-foreground">{amenityInfo.description}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground col-span-2">No amenities information available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Policies & Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Policies & Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Cancellation Policy</p>
                      <p className="text-sm text-muted-foreground">
                        Free cancellation up to 24 hours before departure. 50% refund for cancellations within 24 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Baggage Allowance</p>
                      <p className="text-sm text-muted-foreground">
                        Each passenger is allowed one carry-on bag (max 7kg) and one checked bag (max 20kg).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Check-in Time</p>
                      <p className="text-sm text-muted-foreground">
                        Please arrive at the pickup point at least 15 minutes before departure time.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">ID Requirements</p>
                      <p className="text-sm text-muted-foreground">
                        Valid government-issued ID required for all passengers during check-in.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-semibold text-right">{trip.from} → {trip.to}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-semibold">{new Date(trip.departureTime).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Departure</span>
                    <span className="font-semibold">{formatTime(trip.departureTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">{trip.duration}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Passengers
                    </span>
                    <span className="font-semibold">{passengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per seat</span>
                    <span className="font-semibold">{formatPrice(trip.price)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Amount</span>
                    <span className="font-bold text-2xl text-primary">
                      {formatPrice(trip.price * parseInt(passengers))}
                    </span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleBookNow}>
                  Book Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-semibold text-sm">Need Help?</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>1900-xxxx</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>support@busticket.vn</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
