import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/feedback/StarRating';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { Calendar, MessageSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';

interface FeedbackItem {
  id: string;
  bookingId: string;
  rating: number;
  recommendation: number;
  comment: string;
  photos: string[];
  submittedAt: string;
  trip: {
    id: string;
    origin: string;
    destination: string;
    departureTime: string;
    status: string;
  };
}

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

export default function MyReviews() {
  const user = useUserStore((s) => s.me);
  const [searchParams] = useSearchParams();
  const highlightBookingId = searchParams.get('highlight');
  const highlightRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useQuery<FeedbackItem[]>({
    queryKey: ['my-reviews', user?.id],
    queryFn: async () => {
      const response = await http.get<FeedbackItem[]>(
        `/feedback/user/${user?.id}`
      );
      return response.data;
    },
    enabled: !!user?.id,
  });

  const reviews = data || [];

  // Scroll to highlighted review - MUST be before any early returns
  useEffect(() => {
    if (highlightBookingId && highlightRef.current && reviews.length > 0) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [highlightBookingId, reviews]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Loading your reviews...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive">Failed to load reviews</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
          <p className="text-muted-foreground text-sm mt-2">
            View all your trip reviews and feedback
          </p>
        </header>

        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                You haven't submitted any reviews yet
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Complete a trip and share your experience!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reviews.map((review) => {
              const isHighlighted = highlightBookingId === review.bookingId;
              return (
                <Card 
                  key={review.id} 
                  ref={isHighlighted ? highlightRef : null}
                  className={`shadow-sm transition-all duration-300 ${
                    isHighlighted 
                      ? 'ring-2 ring-primary border-primary bg-primary/5' 
                      : ''
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg font-semibold">
                            {review.trip.origin} → {review.trip.destination}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {review.trip.status}
                          </Badge>
                          {isHighlighted && (
                            <Badge className="bg-primary text-primary-foreground">
                              Your Latest Review
                            </Badge>
                          )}
                        </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDateTime(review.trip.departureTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          Reviewed {formatDateTime(review.submittedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Ratings */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Trip Rating</p>
                      <StarRating 
                        value={review.rating} 
                        onChange={() => {}} 
                        readonly 
                        size="md" 
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Would Recommend
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {review.recommendation}/10
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <p className="text-sm font-medium mb-2">Your Feedback</p>
                    <p className="text-sm text-foreground bg-muted p-4 rounded-lg border">
                      {review.comment}
                    </p>
                  </div>

                  {/* Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Photos</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {review.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="aspect-square rounded-lg overflow-hidden border"
                          >
                            <img
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
