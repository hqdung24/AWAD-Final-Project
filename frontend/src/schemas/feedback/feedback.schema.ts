import { z } from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

export const feedbackFormSchema = z.object({
  rating: z
    .number()
    .min(1, 'Please select a rating')
    .max(5, 'Rating must be between 1 and 5'),
  comment: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(1000, 'Feedback must not exceed 1000 characters'),
  recommendation: z
    .number()
    .min(1, 'Please select a rating')
    .max(10, 'Rating must be between 1 and 10'),
  photos: z
    .array(
      z.instanceof(File).refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        'Only JPEG, PNG, WebP, and SVG images are allowed'
      )
    )
    .max(5, 'You can upload a maximum of 5 photos')
    .optional(),
});

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;
