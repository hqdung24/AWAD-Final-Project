import { useBooking } from '@/hooks/useBooking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StarRating } from '@/components/feedback/StarRating';
import { PhotoUpload } from '@/components/feedback/PhotoUpload';
import {
  feedbackFormSchema,
  type FeedbackFormData,
} from '@/schemas/feedback/feedback.schema';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createFeedback } from '@/services/feedbackService';
import { useState } from 'react';

function formatDateTime(iso?: string) {
  if (!iso) return '--';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function TripFeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { bookingDetail } = useBooking(undefined, id);
  const { data, isLoading } = bookingDetail;

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      rating: 0,
      comment: '',
      recommendation: 0,
      photos: [],
    },
  });

  const onSubmit = async (formData: FeedbackFormData) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await createFeedback({
        bookingId: id,
        rating: formData.rating,
        recommendation: formData.recommendation,
        comment: formData.comment,
        photos: formData.photos,
      });
      
      toast.success('Thank you for your feedback!');
      navigate(`/upcoming-trip/${id}`);
    } catch (error: unknown) {
      console.error('Failed to submit feedback:', error);
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to submit feedback. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/upcoming-trip/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Booking not found</p>
              <Button className="mt-4" onClick={() => navigate('/upcoming-trip')}>
                Back to Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const trip = data.trip;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/upcoming-trip/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Booking Detail
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Rate Your Experience</CardTitle>
            <div className="text-sm text-muted-foreground">
              Booking Reference: {data.bookingReference || data.bookingId}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trip Info */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {trip.origin} → {trip.destination}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(trip.departureTime)}</span>
              </div>
            </div>

            <Separator />

            {/* Feedback Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Comment */}
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        Share your experience *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your trip experience..."
                          className="min-h-[120px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <FormMessage />
                        <span>{field.value.length} / 1000</span>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Rating */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        How was your trip? *
                      </FormLabel>
                      <FormControl>
                        <div className="pt-2">
                          <StarRating
                            value={field.value}
                            onChange={field.onChange}
                            size="lg"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Recommendation */}
                <FormField
                  control={form.control}
                  name="recommendation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        Would you like to share this service to others? *
                      </FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-3 pt-2">
                          <div className="flex justify-between gap-2 w-full">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => field.onChange(value)}
                                className={cn(
                                  'w-8 h-8 rounded-full border-2 transition-all',
                                  'flex items-center justify-center text-sm font-medium',
                                  field.value === value
                                    ? 'border-primary bg-primary text-primary-foreground shadow-md scale-110'
                                    : 'border-border hover:border-primary/50 hover:scale-105'
                                )}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Not at all</span>
                            <span>Definitely</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photos */}
                <FormField
                  control={form.control}
                  name="photos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        Add Photos (Optional)
                      </FormLabel>
                      <FormControl>
                        <PhotoUpload
                          photos={field.value || []}
                          onChange={field.onChange}
                          maxPhotos={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
