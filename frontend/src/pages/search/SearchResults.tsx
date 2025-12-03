import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Bus, Clock, Wifi, Snowflake, Coffee, Armchair } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock data - replace with API call later
const mockTrips = [
  { id: 1, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '08:00', arrivalTime: '20:00', duration: '12h', price: 350000, busType: 'Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 12 },
  { id: 2, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '18:00', arrivalTime: '06:00', duration: '12h', price: 380000, busType: 'VIP Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 8 },
  { id: 3, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '22:00', arrivalTime: '10:00', duration: '12h', price: 320000, busType: 'Sleeper', company: 'Mai Linh', amenities: ['wifi', 'ac'], seatsAvailable: 15 },
  { id: 4, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '06:00', arrivalTime: '18:00', duration: '12h', price: 400000, busType: 'Limousine', company: 'Thanh Buoi', amenities: ['wifi', 'ac', 'water', 'blanket', 'snack'], seatsAvailable: 5 },
  { id: 5, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '09:30', arrivalTime: '21:30', duration: '12h', price: 340000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac'], seatsAvailable: 20 },
  { id: 6, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '14:00', arrivalTime: '02:00', duration: '12h', price: 365000, busType: 'Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 10 },
  { id: 7, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '20:00', arrivalTime: '08:00', duration: '12h', price: 390000, busType: 'VIP Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 6 },
  { id: 8, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '07:00', arrivalTime: '19:00', duration: '12h', price: 330000, busType: 'Sleeper', company: 'Mai Linh', amenities: ['wifi', 'ac'], seatsAvailable: 18 },
  { id: 9, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '11:00', arrivalTime: '23:00', duration: '12h', price: 355000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac', 'water'], seatsAvailable: 25 },
  { id: 10, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '16:00', arrivalTime: '04:00', duration: '12h', price: 375000, busType: 'Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 9 },
  { id: 11, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '23:00', arrivalTime: '11:00', duration: '12h', price: 310000, busType: 'Seat', company: 'Mai Linh', amenities: ['ac'], seatsAvailable: 22 },
  { id: 12, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '05:00', arrivalTime: '17:00', duration: '12h', price: 420000, busType: 'Limousine', company: 'Thanh Buoi', amenities: ['wifi', 'ac', 'water', 'blanket', 'snack'], seatsAvailable: 4 },
  { id: 13, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '10:00', arrivalTime: '22:00', duration: '12h', price: 345000, busType: 'Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 14 },
  { id: 14, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '15:00', arrivalTime: '03:00', duration: '12h', price: 360000, busType: 'VIP Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 7 },
  { id: 15, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '19:00', arrivalTime: '07:00', duration: '12h', price: 385000, busType: 'VIP Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 5 },
  { id: 16, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '12:00', arrivalTime: '00:00', duration: '12h', price: 325000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac'], seatsAvailable: 28 },
  { id: 17, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '21:00', arrivalTime: '09:00', duration: '12h', price: 370000, busType: 'Sleeper', company: 'Mai Linh', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 11 },
  { id: 18, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '08:30', arrivalTime: '20:30', duration: '12h', price: 410000, busType: 'Limousine', company: 'Thanh Buoi', amenities: ['wifi', 'ac', 'water', 'blanket', 'snack'], seatsAvailable: 6 },
  { id: 19, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '13:00', arrivalTime: '01:00', duration: '12h', price: 335000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac'], seatsAvailable: 24 },
  { id: 20, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '17:00', arrivalTime: '05:00', duration: '12h', price: 395000, busType: 'VIP Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 7 },
  { id: 21, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '09:00', arrivalTime: '21:00', duration: '12h', price: 348000, busType: 'Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 13 },
  { id: 22, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '23:30', arrivalTime: '11:30', duration: '12h', price: 315000, busType: 'Seat', company: 'Mai Linh', amenities: ['ac'], seatsAvailable: 26 },
  { id: 23, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '06:30', arrivalTime: '18:30', duration: '12h', price: 405000, busType: 'Limousine', company: 'Thanh Buoi', amenities: ['wifi', 'ac', 'water', 'blanket', 'snack'], seatsAvailable: 5 },
  { id: 24, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '11:30', arrivalTime: '23:30', duration: '12h', price: 358000, busType: 'Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 16 },
  { id: 25, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '15:30', arrivalTime: '03:30', duration: '12h', price: 368000, busType: 'VIP Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 8 },
  { id: 26, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '19:30', arrivalTime: '07:30', duration: '12h', price: 378000, busType: 'Sleeper', company: 'Mai Linh', amenities: ['wifi', 'ac'], seatsAvailable: 12 },
  { id: 27, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '07:30', arrivalTime: '19:30', duration: '12h', price: 338000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac', 'water'], seatsAvailable: 21 },
  { id: 28, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '12:30', arrivalTime: '00:30', duration: '12h', price: 352000, busType: 'Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 10 },
  { id: 29, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '20:30', arrivalTime: '08:30', duration: '12h', price: 388000, busType: 'VIP Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 6 },
  { id: 30, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '05:30', arrivalTime: '17:30', duration: '12h', price: 415000, busType: 'Limousine', company: 'Thanh Buoi', amenities: ['wifi', 'ac', 'water', 'blanket', 'snack'], seatsAvailable: 4 },
  { id: 31, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '10:30', arrivalTime: '22:30', duration: '12h', price: 342000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac'], seatsAvailable: 19 },
  { id: 32, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '14:30', arrivalTime: '02:30', duration: '12h', price: 362000, busType: 'Sleeper', company: 'Mai Linh', amenities: ['wifi', 'ac'], seatsAvailable: 14 },
  { id: 33, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '18:30', arrivalTime: '06:30', duration: '12h', price: 382000, busType: 'VIP Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 7 },
  { id: 34, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '22:30', arrivalTime: '10:30', duration: '12h', price: 318000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac'], seatsAvailable: 23 },
  { id: 35, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '08:15', arrivalTime: '20:15', duration: '12h', price: 353000, busType: 'Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 11 },
  { id: 36, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '13:30', arrivalTime: '01:30', duration: '12h', price: 372000, busType: 'VIP Sleeper', company: 'Mai Linh', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 9 },
  { id: 37, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '17:30', arrivalTime: '05:30', duration: '12h', price: 392000, busType: 'Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 8 },
  { id: 38, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '21:30', arrivalTime: '09:30', duration: '12h', price: 328000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac'], seatsAvailable: 27 },
  { id: 39, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '06:15', arrivalTime: '18:15', duration: '12h', price: 408000, busType: 'Limousine', company: 'Thanh Buoi', amenities: ['wifi', 'ac', 'water', 'blanket', 'snack'], seatsAvailable: 6 },
  { id: 40, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '11:15', arrivalTime: '23:15', duration: '12h', price: 347000, busType: 'Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 15 },
  { id: 41, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '16:30', arrivalTime: '04:30', duration: '12h', price: 377000, busType: 'VIP Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 7 },
  { id: 42, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '09:15', arrivalTime: '21:15', duration: '12h', price: 343000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac', 'water'], seatsAvailable: 22 },
  { id: 43, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '23:15', arrivalTime: '11:15', duration: '12h', price: 313000, busType: 'Seat', company: 'Mai Linh', amenities: ['ac'], seatsAvailable: 25 },
  { id: 44, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '07:15', arrivalTime: '19:15', duration: '12h', price: 333000, busType: 'Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac'], seatsAvailable: 17 },
  { id: 45, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '12:15', arrivalTime: '00:15', duration: '12h', price: 327000, busType: 'Seat', company: 'Kumho Samco', amenities: ['ac'], seatsAvailable: 20 },
  { id: 46, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '18:15', arrivalTime: '06:15', duration: '12h', price: 387000, busType: 'VIP Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 8 },
  { id: 47, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '14:15', arrivalTime: '02:15', duration: '12h', price: 367000, busType: 'Sleeper', company: 'Mai Linh', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 13 },
  { id: 48, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '19:15', arrivalTime: '07:15', duration: '12h', price: 383000, busType: 'VIP Sleeper', company: 'Phuong Trang', amenities: ['wifi', 'ac', 'water', 'blanket'], seatsAvailable: 6 },
  { id: 49, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '05:15', arrivalTime: '17:15', duration: '12h', price: 418000, busType: 'Limousine', company: 'Thanh Buoi', amenities: ['wifi', 'ac', 'water', 'blanket', 'snack'], seatsAvailable: 5 },
  { id: 50, from: 'Ho Chi Minh City', to: 'Hanoi', departureTime: '10:15', arrivalTime: '22:15', duration: '12h', price: 349000, busType: 'Sleeper', company: 'Hoang Long', amenities: ['wifi', 'ac', 'water'], seatsAvailable: 12 },
];

const departureTimeSlots = [
  { label: 'Morning (06:00 - 12:00)', value: 'morning' },
  { label: 'Afternoon (12:00 - 18:00)', value: 'afternoon' },
  { label: 'Evening (18:00 - 00:00)', value: 'evening' },
  { label: 'Night (00:00 - 06:00)', value: 'night' },
];

const busTypes = ['Seat', 'Sleeper', 'VIP Sleeper', 'Limousine'];

const amenitiesList = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
  { id: 'water', label: 'Water', icon: Coffee },
  { id: 'blanket', label: 'Blanket', icon: Armchair },
];

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1';

  const [sortBy, setSortBy] = useState<string>('price-asc');
  const [priceRange, setPriceRange] = useState<number[]>([0, 500000]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const getTimeSlot = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night';
  };

  // Filter trips
  const filteredTrips = mockTrips.filter((trip) => {
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
                          <p className="text-2xl font-bold">{trip.departureTime}</p>
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
                          <p className="text-2xl font-bold">{trip.arrivalTime}</p>
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
