import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useBooking } from '@/hooks/useBooking';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import {
  createBookingRequestSchema,
  type CreateBookingRequest,
} from '@/schemas/booking';
import { getSeatsByTrip } from '@/services/seatService';
import { getTripDetails } from '@/services/tripService';
import { useUserStore } from '@/stores/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Calendar,
  Clock,
  Lock,
  MapPin,
  Users,
  Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

export default function ConfirmBooking() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');
  const lockToken = searchParams.get('lock_token') || '';
  const seatIds = useMemo(
    () => searchParams.get('seat_ids')?.split(',') || [],
    [searchParams]
  );

  const [paymentMethod, setPaymentMethod] = useState<string>('vietqr');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const user = useUserStore((s) => s.me);
  const [pickupPointId, setPickupPointId] = useState<string>('');
  const [dropoffPointId, setDropoffPointId] = useState<string>('');

  const [isInitialized, setIsInitialized] = useState(false);

  const { createBooking } = useBooking();
  const { mutateAsync, isPending } = createBooking;

  // Initialize react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors: formErrors },
  } = useForm<CreateBookingRequest>({
    resolver: zodResolver(createBookingRequestSchema),
    defaultValues: {
      lockToken: lockToken,
      passengers: [],
      contactInfo: {
        name: user ? user.firstName + ' ' + user.lastName : '',
        email: user?.email || '',
        phone: '',
      },
    },
  });

  const { fields: passengerFields } = useFieldArray({
    control,
    name: 'passengers',
  });

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
      const selectedSeats = seatStatuses.filter((s) =>
        seatIds.includes(s.seatId)
      );
      const initialDetails = selectedSeats.map((seat) => ({
        seatCode: seat.seat.seatCode,
        fullName: '',
        documentId: '',
        phone: '',
      }));
      setValue('passengers', initialDetails);
      setIsInitialized(true);
    }
  }, [seatStatuses, seatIds, isInitialized, setValue]);

  useEffect(() => {
    if (!trip?.routePoints) return;
    const pickup = trip.routePoints.pickup ?? [];
    const dropoff = trip.routePoints.dropoff ?? [];
    if (!pickupPointId && pickup.length > 0) {
      setPickupPointId(pickup[0].id);
    }
    if (!dropoffPointId && dropoff.length > 0) {
      setDropoffPointId(dropoff[0].id);
    }
  }, [trip?.routePoints, pickupPointId, dropoffPointId]);

  // Redirect if no lock token or seat IDs
  useEffect(() => {
    if (!lockToken || seatIds.length === 0) {
      notify.error('Invalid booking session. Please select seats again.');
      navigate(
        `/search/${id}?from=${from}&to=${to}&date=${date}&passengers=${passengers}`
      );
    }
  }, [lockToken, seatIds, id, from, to, date, passengers, navigate]);

  // Don't render anything if we don't have valid session data
  if (!lockToken || seatIds.length === 0) {
    return null;
  }

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

  const onSubmit = async (data: CreateBookingRequest) => {
    if (!agreeToTerms) {
      notify.error('Please agree to the Terms and Conditions');
      return;
    }
    if (trip?.routePoints?.pickup?.length && !pickupPointId) {
      notify.error('Please select a pickup point');
      return;
    }
    if (trip?.routePoints?.dropoff?.length && !dropoffPointId) {
      notify.error('Please select a dropoff point');
      return;
    }

    // Add a random UUID for paymentMethodId to prevent backend validation error
    const bookingData: CreateBookingRequest = {
      ...data,
      paymentMethodId: crypto.randomUUID(),
      userId: user?.id,
      pickupPointId: pickupPointId || undefined,
      dropoffPointId: dropoffPointId || undefined,
    };

    const result = await mutateAsync(bookingData);
    if (result) {
      //Navigate to payment page after successful booking creation
      navigate(`/payment/${result.bookingId}`);
    }
  };

  if (!trip || !seatStatuses || passengerFields.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">
                Loading checkout...
              </h3>
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
  const selectedSeatCodes = passengerFields.map((p) => p.seatCode).join(', ');

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Secure Checkout</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Passenger Details & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>CONTACT INFORMATION</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Contact Name */}
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Full Name:</Label>
                      <Controller
                        name="contactInfo.name"
                        control={control}
                        render={({ field }) => (
                          <>
                            <Input
                              {...field}
                              id="contactName"
                              type="text"
                              placeholder="Enter contact name"
                              className={cn(
                                formErrors.contactInfo?.name && 'border-red-500'
                              )}
                            />
                            {formErrors.contactInfo?.name && (
                              <p className="text-sm text-red-500">
                                {formErrors.contactInfo.name.message}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    {/* Contact Email */}
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email:</Label>
                      <Controller
                        name="contactInfo.email"
                        control={control}
                        render={({ field }) => (
                          <>
                            <Input
                              {...field}
                              id="contactEmail"
                              type="email"
                              placeholder="Enter email address"
                              className={cn(
                                formErrors.contactInfo?.email &&
                                  'border-red-500'
                              )}
                            />
                            {formErrors.contactInfo?.email && (
                              <p className="text-sm text-red-500">
                                {formErrors.contactInfo.email.message}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    {/* Contact Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone:</Label>
                      <Controller
                        name="contactInfo.phone"
                        control={control}
                        render={({ field }) => (
                          <>
                            <Input
                              {...field}
                              id="contactPhone"
                              type="tel"
                              placeholder="Enter phone number"
                              className={cn(
                                formErrors.contactInfo?.phone &&
                                  'border-red-500'
                              )}
                            />
                            {formErrors.contactInfo?.phone && (
                              <p className="text-sm text-red-500">
                                {formErrors.contactInfo.phone.message}
                              </p>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {trip?.routePoints && (
                <Card>
                  <CardHeader>
                    <CardTitle>PICKUP & DROPOFF</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="pickupPoint">Pickup point</Label>
                        <select
                          id="pickupPoint"
                          className="border-input bg-background text-sm px-3 py-2 rounded-md border w-full"
                          value={pickupPointId}
                          onChange={(e) => setPickupPointId(e.target.value)}
                          disabled={!trip.routePoints.pickup.length}
                        >
                          {trip.routePoints.pickup.length === 0 && (
                            <option value="">No pickup points</option>
                          )}
                          {trip.routePoints.pickup.map((point) => (
                            <option key={point.id} value={point.id}>
                              {point.orderIndex ?? 0}. {point.name}
                            </option>
                          ))}
                        </select>
                        {trip.routePoints.pickup.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {trip.routePoints.pickup.find((p) => p.id === pickupPointId)
                              ?.address || ''}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dropoffPoint">Dropoff point</Label>
                        <select
                          id="dropoffPoint"
                          className="border-input bg-background text-sm px-3 py-2 rounded-md border w-full"
                          value={dropoffPointId}
                          onChange={(e) => setDropoffPointId(e.target.value)}
                          disabled={!trip.routePoints.dropoff.length}
                        >
                          {trip.routePoints.dropoff.length === 0 && (
                            <option value="">No dropoff points</option>
                          )}
                          {trip.routePoints.dropoff.map((point) => (
                            <option key={point.id} value={point.id}>
                              {point.orderIndex ?? 0}. {point.name}
                            </option>
                          ))}
                        </select>
                        {trip.routePoints.dropoff.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {trip.routePoints.dropoff.find((p) => p.id === dropoffPointId)
                              ?.address || ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Passenger Details */}
              <Card>
                <CardHeader>
                  <CardTitle>PASSENGER DETAILS</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Scrollable container with fixed height */}
                  <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6">
                    {passengerFields.map((field, index) => (
                      <div key={field.id} className="space-y-4">
                        <h3 className="font-semibold text-sm">
                          Passenger {index + 1} (Seat {field.seatCode})
                        </h3>

                        {/* Full Name */}
                        <div className="space-y-2">
                          <Label htmlFor={`fullName-${index}`}>
                            Full Name:
                          </Label>
                          <Controller
                            name={`passengers.${index}.fullName`}
                            control={control}
                            render={({ field: inputField }) => (
                              <>
                                <Input
                                  {...inputField}
                                  id={`fullName-${index}`}
                                  type="text"
                                  placeholder="Enter full name"
                                  className={cn(
                                    formErrors.passengers?.[index]?.fullName &&
                                      'border-red-500'
                                  )}
                                />
                                {formErrors.passengers?.[index]?.fullName && (
                                  <p className="text-sm text-red-500">
                                    {
                                      formErrors.passengers[index]?.fullName
                                        ?.message
                                    }
                                  </p>
                                )}
                              </>
                            )}
                          />
                        </div>

                        {/* ID/Passport */}
                        <div className="space-y-2">
                          <Label htmlFor={`documentId-${index}`}>
                            ID/Passport:
                          </Label>
                          <Controller
                            name={`passengers.${index}.documentId`}
                            control={control}
                            render={({ field: inputField }) => (
                              <>
                                <Input
                                  {...inputField}
                                  id={`documentId-${index}`}
                                  type="text"
                                  placeholder="Enter ID or passport number"
                                  className={cn(
                                    formErrors.passengers?.[index]
                                      ?.documentId && 'border-red-500'
                                  )}
                                />
                                {formErrors.passengers?.[index]?.documentId && (
                                  <p className="text-sm text-red-500">
                                    {
                                      formErrors.passengers[index]?.documentId
                                        ?.message
                                    }
                                  </p>
                                )}
                              </>
                            )}
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <Label htmlFor={`phone-${index}`}>
                            Phone (Optional):
                          </Label>
                          <Controller
                            name={`passengers.${index}.phone`}
                            control={control}
                            render={({ field: inputField }) => (
                              <>
                                <Input
                                  {...inputField}
                                  id={`phone-${index}`}
                                  type="tel"
                                  placeholder="Enter phone number"
                                  className={cn(
                                    formErrors.passengers?.[index]?.phone &&
                                      'border-red-500'
                                  )}
                                />
                                {formErrors.passengers?.[index]?.phone && (
                                  <p className="text-sm text-red-500">
                                    {
                                      formErrors.passengers[index]?.phone
                                        ?.message
                                    }
                                  </p>
                                )}
                              </>
                            )}
                          />
                        </div>

                        {index < passengerFields.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method - only VietQR */}
              <Card>
                <CardHeader>
                  <CardTitle>PAYMENT METHOD</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary transition-colors">
                        <RadioGroupItem value="vietqr" id="vietqr" />
                        <Label
                          htmlFor="vietqr"
                          className="flex items-center gap-2 cursor-pointer font-medium flex-1"
                        >
                          <Wallet className="h-4 w-4" />
                          VietQR Banking
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
                        onCheckedChange={(checked) =>
                          setAgreeToTerms(checked as boolean)
                        }
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
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={!agreeToTerms || isPending}
                  >
                    Confirm & Proceed
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
                        <p className="font-semibold">
                          {trip.from} → {trip.to}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        Date: {formatDate(trip.departureTime)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">
                        Departure: {formatTime(trip.departureTime)}
                      </p>
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
                        <p className="text-sm font-medium">
                          Seats: {selectedSeatCodes}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Passengers: {passengers}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fare:</span>
                      <span className="font-semibold">
                        {formatPrice(fareTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Service fee:
                      </span>
                      <span className="font-semibold">
                        {formatPrice(serviceFee)}
                      </span>
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
        </form>
      </div>
    </div>
  );
}
