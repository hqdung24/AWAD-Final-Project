import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Bus, Clock, Wifi, Snowflake, Coffee, Armchair } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { searchTrips } from '@/services/searchService';
import { notify } from '@/lib/notify';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1';

  // Fetch trips from API
  const { data: trips = [], isLoading, error } = useQuery({
    queryKey: ['search-trips', from, to, date, passengers],
    queryFn: () => searchTrips({
      from,
      to,
      date,
      passengers: parseInt(passengers),
    }),
    enabled: !!(from && to && date),
  });

  useEffect(() => {
    if (error) {
      notify.error('Failed to load trips. Please try again.');
    }
  }, [error]);

  const [sortBy, setSortBy] = useState<string>('price-asc');
  const [priceRange, setPriceRange] = useState<number[]>([0, 500000]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const departureTimeSlots = [
    { label: 'Morning (06:00 - 12:00)', value: 'morning' },
    { label: 'Afternoon (12:00 - 18:00)', value: 'afternoon' },
    { label: 'Evening (18:00 - 00:00)', value: 'evening' },
    { label: 'Night (00:00 - 06:00)', value: 'night' },
  ];

  const busTypes = ['Seat', 'Sleeper', 'VIP Sleeper', 'Limousine'];

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'air_conditioning', label: 'Air Conditioning', icon: Snowflake },
    { id: 'water', label: 'Water', icon: Coffee },
    { id: 'blanket', label: 'Blanket', icon: Armchair },
  ];

  const handleTimeSlotToggle = (value: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleBusTypeToggle = (value: string) => {
    setSelectedBusTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleAmenityToggle = (value: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const getTimeSlot = (timeString: string) => {
    const date = new Date(timeString);
    const hour = date.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night';
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    const priceMatch = trip.price >= priceRange[0] && trip.price <= priceRange[1];
    const timeMatch = selectedTimeSlots.length === 0 || selectedTimeSlots.includes(getTimeSlot(trip.departureTime));
    const busTypeMatch = selectedBusTypes.length === 0 || selectedBusTypes.includes(trip.busType);
    const amenitiesMatch = selectedAmenities.length === 0 || selectedAmenities.every((a) => trip.amenities.includes(a));
    return priceMatch && timeMatch && busTypeMatch && amenitiesMatch;
  });

  // Sort trips
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'time-asc':
        return a.departureTime.localeCompare(b.departureTime);
      case 'time-desc':
        return b.departureTime.localeCompare(a.departureTime);
      case 'duration-asc':
        return parseInt(a.duration) - parseInt(b.duration);
      case 'duration-desc':
        return parseInt(b.duration) - parseInt(a.duration);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedTrips.length / itemsPerPage);
  const paginatedTrips = sortedTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Bus className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Loading trips...</h3>
              <p className="text-muted-foreground">Please wait while we search for available trips</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {from} → {to}
          </h1>
          <p className="text-muted-foreground">
            {date} • {passengers} passenger{parseInt(passengers) > 1 ? 's' : ''} • {sortedTrips.length} trip{sortedTrips.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Price Range</Label>
                  <div className="space-y-2">
                    <Slider
                      min={0}
                      max={500000}
                      step={10000}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                {/* Departure Time */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Departure Time</Label>
                  <div className="space-y-2">
                    {departureTimeSlots.map((slot) => (
                      <div key={slot.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={slot.value}
                          checked={selectedTimeSlots.includes(slot.value)}
                          onCheckedChange={() => handleTimeSlotToggle(slot.value)}
                        />
                        <Label
                          htmlFor={slot.value}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {slot.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bus Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Bus Type</Label>
                  <div className="space-y-2">
                    {busTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedBusTypes.includes(type)}
                          onCheckedChange={() => handleBusTypeToggle(type)}
                        />
                        <Label
                          htmlFor={type}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Amenities</Label>
                  <div className="space-y-2">
                    {amenitiesList.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <div key={amenity.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={amenity.id}
                            checked={selectedAmenities.includes(amenity.id)}
                            onCheckedChange={() => handleAmenityToggle(amenity.id)}
                          />
                          <Label
                            htmlFor={amenity.id}
                            className="text-sm font-normal cursor-pointer flex items-center gap-2"
                          >
                            <Icon className="h-3 w-3" />
                            {amenity.label}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setPriceRange([0, 500000]);
                    setSelectedTimeSlots([]);
                    setSelectedBusTypes([]);
                    setSelectedAmenities([]);
                  }}
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sort Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold whitespace-nowrap">Sort by:</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="time-asc">Departure: Earliest</SelectItem>
                        <SelectItem value="time-desc">Departure: Latest</SelectItem>
                        <SelectItem value="duration-asc">Duration: Shortest</SelectItem>
                        <SelectItem value="duration-desc">Duration: Longest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator orientation="vertical" className="hidden sm:block h-8" />
                  <div className="text-sm text-muted-foreground">
                    Showing {paginatedTrips.length} of {sortedTrips.length} result{sortedTrips.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Cards */}
            {paginatedTrips.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No trips found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
                </CardContent>
              </Card>
            ) : (
              paginatedTrips.map((trip) => (
                <Card key={trip.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Company & Bus Type */}
                      <div className="md:col-span-2 flex flex-col justify-center">
                        <p className="font-semibold text-sm">{trip.company}</p>
                        <p className="text-xs text-muted-foreground">{trip.busType}</p>
                      </div>

                      {/* Time & Route */}
                      <div className="md:col-span-5 flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{formatTime(trip.departureTime)}</p>
                          <p className="text-xs text-muted-foreground">{trip.from}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="flex items-center gap-2 w-full">
                            <div className="flex-1 h-px bg-border" />
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 h-px bg-border" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{trip.duration}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{formatTime(trip.arrivalTime)}</p>
                          <p className="text-xs text-muted-foreground">{trip.to}</p>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="md:col-span-2 flex items-center justify-center gap-2">
                        {trip.amenities.includes('wifi') && <Wifi className="h-4 w-4 text-info" />}
                        {trip.amenities.includes('ac') && <Snowflake className="h-4 w-4 text-info" />}
                        {trip.amenities.includes('water') && <Coffee className="h-4 w-4 text-info" />}
                        {trip.amenities.includes('blanket') && <Armchair className="h-4 w-4 text-info" />}
                      </div>

                      {/* Price & Action */}
                      <div className="md:col-span-3 flex flex-col justify-center items-end gap-2">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{formatPrice(trip.price)}</p>
                          <p className="text-xs text-muted-foreground">{trip.seatsAvailable} seats left</p>
                        </div>
                        <Button className="w-full md:w-auto">Select</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {totalPages <= 5 ? (
                        // Show all pages if 5 or fewer
                        Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        ))
                      ) : (
                        // Show first 2, ellipsis, last 2 if more than 5 pages
                        <>
                          {/* First 2 pages */}
                          {[1, 2].map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          ))}
                          
                          {/* Middle pages or ellipsis */}
                          {currentPage > 3 && currentPage < totalPages - 2 ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="w-10"
                              >
                                ...
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage)}
                                className="w-10"
                              >
                                {currentPage}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="w-10"
                              >
                                ...
                              </Button>
                            </>
                          ) : currentPage === 3 ? (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setCurrentPage(3)}
                                className="w-10"
                              >
                                3
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="w-10"
                              >
                                ...
                              </Button>
                            </>
                          ) : currentPage === totalPages - 2 ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="w-10"
                              >
                                ...
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => setCurrentPage(totalPages - 2)}
                                className="w-10"
                              >
                                {totalPages - 2}
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="w-10"
                            >
                              ...
                            </Button>
                          )}
                          
                          {/* Last 2 pages */}
                          {[totalPages - 1, totalPages].map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          ))}
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
