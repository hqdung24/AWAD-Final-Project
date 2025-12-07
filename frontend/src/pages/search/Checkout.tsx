import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Lock,
  CreditCard,
  Wallet,
  Building2,
  AlertCircle,
  Calendar,
  MapPin,
  Clock,
  Users,
} from 'lucide-react';
import { getTripDetails } from '@/services/tripService';
import { getSeatsByTrip } from '@/services/seatService';
import { notify } from '@/lib/notify';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PassengerInfo {
  seatCode: string;
  fullName: string;
  documentId: string;
  phone: string;
}

export default function Checkout() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const lockToken = searchParams.get('lock_token') || '';
  const seatIds = searchParams.get('seat_ids')?.split(',') || [];

  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState<PassengerInfo[]>([]);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: trip } = useQuery({
    queryKey: ['trip-details', id],
    queryFn: () => getTripDetails(id!),
    enabled: !!id,
  });

  const { data: seatStatuses } = useQuery({
    queryKey: ['trip-seats', id],
    queryFn: () => getSeatsByTrip(id!),
    enabled: !!id,
  });

  // Initialize passenger details with seat codes
  useEffect(() => {
    if (seatStatuses && seatIds.length > 0 && !isInitialized) {
      const selectedSeats = seatStatuses.filter(s => seatIds.includes(s.seatId));
      const initialDetails = selectedSeats.map(seat => ({
        seatCode: seat.seat.seatCode,
        fullName: '',
        documentId: '',
        phone: '',
      }));
      setPassengerDetails(initialDetails);
      setIsInitialized(true);
    }
  }, [seatStatuses, seatIds, isInitialized]);

  // Redirect if no lock token or seat IDs
  useEffect(() => {
    if (!lockToken || seatIds.length === 0) {
      notify.error('Invalid booking session. Please select seats again.');
      navigate(`/search/${id}?from=${from}&to=${to}&date=${date}&passengers=${passengers}`);
    }
  }, [lockToken, seatIds, id, from, to, date, passengers, navigate]);

  // Don't render anything if we don't have valid session data
  if (!lockToken || seatIds.length === 0) {
    return null;
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handlePassengerChange = (index: number, field: keyof PassengerInfo, value: string) => {
    setPassengerDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });

    // Clear error for this field
    setErrors(prev => {
      const updated = { ...prev };
      if (updated[index]) {
        delete updated[index][field];
      }
      return updated;
    });
  };

  const validatePassengerDetails = (): boolean => {
    const newErrors: Record<number, Record<string, string>> = {};
    let isValid = true;

    passengerDetails.forEach((passenger, index) => {
      const passengerErrors: Record<string, string> = {};

      if (!passenger.fullName.trim()) {
        passengerErrors.fullName = 'Full name is required';
        isValid = false;
      }

      if (!passenger.documentId.trim()) {
        passengerErrors.documentId = 'ID/Passport is required';
        isValid = false;
      }

      if (!passenger.phone.trim()) {
        passengerErrors.phone = 'Phone number is required';
        isValid = false;
      } else if (!/^[0-9]{10,11}$/.test(passenger.phone)) {
        passengerErrors.phone = 'Invalid phone number (10-11 digits)';
        isValid = false;
      }

      if (Object.keys(passengerErrors).length > 0) {
        newErrors[index] = passengerErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleCompletePayment = async () => {
    if (!validatePassengerDetails()) {
      notify.error('Please fill in all passenger details correctly');
      return;
    }

    if (!agreeToTerms) {
      notify.error('Please agree to the Terms and Conditions');
      return;
    }

    // TODO: Submit booking with lock_token and passenger details
    notify.success('Processing payment...');
    console.log({
      tripId: id,
      lockToken,
      seatIds,
      passengerDetails,
      paymentMethod,
      totalAmount: trip ? trip.price * seatIds.length + 20000 : 0,
    });
  };

  if (!trip || !seatStatuses || passengerDetails.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Loading checkout...</h3>
              <p className="text-muted-foreground">Please wait</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const serviceFee = 20000;
  const fareTotal = trip.price * seatIds.length;
  const totalAmount = fareTotal + serviceFee;
  const selectedSeatCodes = passengerDetails.map(p => p.seatCode).join(', ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Passenger Details & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Passenger Details */}
            <Card>
              <CardHeader>
                <CardTitle>PASSENGER DETAILS</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Scrollable container with fixed height */}
                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6">
                  {passengerDetails.map((passenger, index) => (
                    <div key={index} className="space-y-4">
                      <h3 className="font-semibold text-sm">
                        Passenger {index + 1} (Seat {passenger.seatCode})
                      </h3>

                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor={`fullName-${index}`}>Full Name:</Label>
                        <Input
                          id={`fullName-${index}`}
                          type="text"
                          placeholder="Enter full name"
                          value={passenger.fullName}
                          onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)}
                          className={cn(errors[index]?.fullName && 'border-red-500')}
                        />
                        {errors[index]?.fullName && (
                          <p className="text-sm text-red-500">{errors[index].fullName}</p>
                        )}
                      </div>

                      {/* ID/Passport */}
                      <div className="space-y-2">
                        <Label htmlFor={`documentId-${index}`}>ID/Passport:</Label>
                        <Input
                          id={`documentId-${index}`}
                          type="text"
                          placeholder="Enter ID or passport number"
                          value={passenger.documentId}
                          onChange={(e) => handlePassengerChange(index, 'documentId', e.target.value)}
                          className={cn(errors[index]?.documentId && 'border-red-500')}
                        />
                        {errors[index]?.documentId && (
                          <p className="text-sm text-red-500">{errors[index].documentId}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${index}`}>Phone:</Label>
                        <Input
                          id={`phone-${index}`}
                          type="tel"
                          placeholder="Enter phone number"
                          value={passenger.phone}
                          onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                          className={cn(errors[index]?.phone && 'border-red-500')}
                        />
                        {errors[index]?.phone && (
                          <p className="text-sm text-red-500">{errors[index].phone}</p>
                        )}
                      </div>

                      {index < passengerDetails.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>PAYMENT METHOD</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {/* Credit/Debit Card */}
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:border-primary transition-colors">
                      <RadioGroupItem value="card" id="card" className="mt-1" />
                      <div className="flex-1">
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer font-medium">
                          <CreditCard className="h-4 w-4" />
                          Credit/Debit Card
                        </Label>
                        {paymentMethod === 'card' && (
                          <div className="mt-3 space-y-3 ml-6 p-3 bg-muted/50 rounded-md border border-dashed">
                            <div>
                              <Label htmlFor="cardNumber" className="text-xs">Card Number</Label>
                              <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="expiryDate" className="text-xs">Expiry Date</Label>
                                <Input id="expiryDate" placeholder="MM/YY" className="mt-1" />
                              </div>
                              <div>
                                <Label htmlFor="cvc" className="text-xs">CVC</Label>
                                <Input id="cvc" placeholder="123" className="mt-1" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* MoMo Wallet */}
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary transition-colors">
                      <RadioGroupItem value="momo" id="momo" />
                      <Label htmlFor="momo" className="flex items-center gap-2 cursor-pointer font-medium flex-1">
                        <Wallet className="h-4 w-4" />
                        MoMo Wallet
                      </Label>
                    </div>

                    {/* ZaloPay */}
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary transition-colors">
                      <RadioGroupItem value="zalopay" id="zalopay" />
                      <Label htmlFor="zalopay" className="flex items-center gap-2 cursor-pointer font-medium flex-1">
                        <Wallet className="h-4 w-4" />
                        ZaloPay
                      </Label>
                    </div>

                    {/* Bank Transfer */}
                    <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary transition-colors">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer font-medium flex-1">
                        <Building2 className="h-4 w-4" />
                        Bank Transfer
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                {/* Terms and Conditions */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      I agree to Terms and Conditions
                    </Label>
                  </div>
                </div>

                {/* Complete Payment Button */}
                <Button
                  className="w-full mt-6"
                  size="lg"
                  disabled={!agreeToTerms}
                  onClick={handleCompletePayment}
                >
                  Complete Payment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>ORDER SUMMARY</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trip Details */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-semibold">{trip.from} → {trip.to}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Date: {formatDate(trip.departureTime)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Departure: {formatTime(trip.departureTime)}</p>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Operator: {trip.company}
                  </div>
                </div>

                <Separator />

                {/* Seats & Passengers */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Seats: {selectedSeatCodes}</p>
                      <p className="text-sm text-muted-foreground">Passengers: {passengers}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fare:</span>
                    <span className="font-semibold">{formatPrice(fareTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee:</span>
                    <span className="font-semibold">{formatPrice(serviceFee)}</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="font-bold text-2xl text-primary">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
