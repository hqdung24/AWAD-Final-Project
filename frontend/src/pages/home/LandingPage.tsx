import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BusFront, Users, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    date: '',
    passengers: '1',
  });

  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  const popularRoutes = [
    { from: 'TP.HCM', to: 'Đà Lạt', price: '250k' },
    { from: 'TP.HCM', to: 'Nha Trang', price: '280k' },
    { from: 'Hà Nội', to: 'Hải Phòng', price: '150k' },
  ];

  const vietnameseCities = [
    'TP.HCM',
    'Hà Nội',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'Đà Lạt',
    'Nha Trang',
    'Huế',
    'Vũng Tàu',
    'Phan Thiết',
    'Mũi Né',
    'Ninh Bình',
    'Hạ Long',
    'Sapa',
    'Thanh Hóa',
    'Tây Ninh',
    'Bến Tre',
    'Long Xuyên',
    'Châu Đốc',
    'Hội An',
    'Quy Nhơn',
    'Cà Mau',
    'Rạch Giá',
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromInputRef.current && !fromInputRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false);
      }
      if (toInputRef.current && !toInputRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterCities = (input: string): string[] => {
    if (!input.trim()) return vietnameseCities;
    const normalizedInput = input.toLowerCase().trim();
    return vietnameseCities.filter((city) =>
      city.toLowerCase().includes(normalizedInput)
    );
  };

  const handleFromChange = (value: string) => {
    setSearchForm((prev) => ({ ...prev, from: value }));
    setFromSuggestions(filterCities(value));
    setShowFromSuggestions(true);
  };

  const handleToChange = (value: string) => {
    setSearchForm((prev) => ({ ...prev, to: value }));
    setToSuggestions(filterCities(value));
    setShowToSuggestions(true);
  };

  const selectFromCity = (city: string) => {
    setSearchForm((prev) => ({ ...prev, from: city }));
    setShowFromSuggestions(false);
  };

  const selectToCity = (city: string) => {
    setSearchForm((prev) => ({ ...prev, to: city }));
    setShowToSuggestions(false);
  };

  const handleSearch = () => {
    if (!searchForm.date) {
      alert('Please select a departure date');
      return;
    }
    if (!searchForm.from || !searchForm.to) {
      alert('Please select both departure and destination points');
      return;
    }
    // Navigate to search results with params
    const params = new URLSearchParams({
      from: searchForm.from,
      to: searchForm.to,
      date: searchForm.date,
      passengers: searchForm.passengers,
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section with Search */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
            FIND THE RIGHT TRIP
          </h1>

          {/* Search Card */}
          <Card className="shadow-soft border-2">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* From */}
                <div className="space-y-2 relative" ref={fromInputRef}>
                  <Label htmlFor="from" className="text-sm font-medium">
                    From
                  </Label>
                  <Input
                    id="from"
                    type="text"
                    placeholder="Enter departure..."
                    value={searchForm.from}
                    onChange={(e) => handleFromChange(e.target.value)}
                    onFocus={() => {
                      setFromSuggestions(filterCities(searchForm.from));
                      setShowFromSuggestions(true);
                    }}
                    className="h-11 text-base"
                    autoComplete="off"
                  />
                  {showFromSuggestions && fromSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                      {fromSuggestions.map((city) => (
                        <button
                          key={city}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-sm"
                          onClick={() => selectFromCity(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* To */}
                <div className="space-y-2 relative" ref={toInputRef}>
                  <Label htmlFor="to" className="text-sm font-medium">
                    To
                  </Label>
                  <Input
                    id="to"
                    type="text"
                    placeholder="Enter destination..."
                    value={searchForm.to}
                    onChange={(e) => handleToChange(e.target.value)}
                    onFocus={() => {
                      setToSuggestions(filterCities(searchForm.to));
                      setShowToSuggestions(true);
                    }}
                    className="h-11 text-base"
                    autoComplete="off"
                  />
                  {showToSuggestions && toSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                      {toSuggestions.map((city) => (
                        <button
                          key={city}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-sm"
                          onClick={() => selectToCity(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Start Date:
                  </Label>
                  <div className="relative">
                    <DatePicker
                      id="date"
                      value={searchForm.date}
                      onValueChange={(value) =>
                        setSearchForm((prev) => ({ ...prev, date: value }))
                      }
                      min={new Date().toISOString().split('T')[0]}
                      aria-invalid={!searchForm.date}
                    />
                    {!searchForm.date && (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        Start date must be today or later
                      </p>
                    )}
                  </div>
                </div>

                {/* Passengers */}
                <div className="space-y-2">
                  <Label htmlFor="passengers" className="text-sm font-medium">
                    Number of Passengers:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-11 px-3"
                      onClick={() =>
                        setSearchForm((prev) => ({
                          ...prev,
                          passengers: String(
                            Math.max(1, parseInt(prev.passengers) - 1)
                          ),
                        }))
                      }
                    >
                      −
                    </Button>
                    <Input
                      id="passengers"
                      type="number"
                      min="1"
                      max="10"
                      value={searchForm.passengers}
                      onChange={(e) =>
                        setSearchForm((prev) => ({
                          ...prev,
                          passengers: e.target.value,
                        }))
                      }
                      className="h-11 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-11 px-3"
                      onClick={() =>
                        setSearchForm((prev) => ({
                          ...prev,
                          passengers: String(
                            Math.min(10, parseInt(prev.passengers) + 1)
                          ),
                        }))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
                size="lg"
              >
                FIND TRIPS
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            TUYẾN ĐƯỜNG PHỔ BIẾN
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularRoutes.map((route, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => {
                  setSearchForm((prev) => ({
                    ...prev,
                    from: route.from,
                    to: route.to,
                  }));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="font-semibold">
                      {route.from} → {route.to}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Từ <span className="text-primary font-bold text-lg">{route.price}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">
            TẠI SAO CHỌN CHÚNG TÔI
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BusFront className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Cập nhật theo thời gian thực</h3>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Thanh toán an toàn</h3>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-info" />
              </div>
              <h3 className="font-semibold text-lg">Hỗ trợ 24/7</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
            <p>Về chúng tôi | Liên hệ | Điều khoản | Bảo mật</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
