import { http } from '@/lib/http';

export interface CreateFeedbackRequest {
  bookingId: string;
  rating: number;
  recommendation: number;
  comment: string;
  photos?: File[];
}

export interface FeedbackResponse {
  id: string;
  bookingId: string;
  rating: number;
  recommendation: number;
  comment: string;
  photos: string[];
  submittedAt: string;
}

export const createFeedback = async (
  data: CreateFeedbackRequest
): Promise<FeedbackResponse> => {
  const formData = new FormData();
  
  formData.append('bookingId', data.bookingId);
  formData.append('rating', data.rating.toString());
  formData.append('recommendation', data.recommendation.toString());
  formData.append('comment', data.comment);
  
  // Append photos if provided
  if (data.photos && data.photos.length > 0) {
    data.photos.forEach((photo) => {
      formData.append('photos', photo);
    });
  }

  const response = await http.post<FeedbackResponse>('/feedback', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const getFeedbackByBooking = async (
  bookingId: string
): Promise<FeedbackResponse | null> => {
  const response = await http.get<FeedbackResponse>(
    `/feedback/booking/${bookingId}`
  );
  return response.data;
};

export const getFeedbackByTrip = async (
  tripId: string
): Promise<FeedbackResponse[]> => {
  const response = await http.get<FeedbackResponse[]>(`/feedback/trip/${tripId}`);
  return response.data;
};
