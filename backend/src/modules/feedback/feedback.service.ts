import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { MediaService } from '../media/media.service';
import { MediaDomain } from '../media/enums/media-domain.enum';
import { MediaType } from '../media/enums/media-type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { BookingRepository } from '../booking/booking.repository';
import { TripRepository } from '../trip/trip.repository';
import type { Express } from 'express';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly mediaService: MediaService,
    private readonly bookingRepository: BookingRepository,
    private readonly tripRepository: TripRepository,
    @InjectRepository(Booking)
    private readonly bookingRepositoryTypeOrm: Repository<Booking>,
  ) {}

  async createFeedback(
    userId: string,
    dto: CreateFeedbackDto,
    photos?: Express.Multer.File[],
  ) {
    console.log('[FeedbackService] Starting createFeedback', {
      userId,
      bookingId: dto.bookingId,
      rating: dto.rating,
      photosCount: photos?.length || 0,
    });

    // Validate booking exists and belongs to user
    console.log('[FeedbackService] Finding booking...');
    const booking = await this.bookingRepositoryTypeOrm.findOne({
      where: { id: dto.bookingId },
      relations: ['trip'],
    });
    console.log('[FeedbackService] Booking found:', !!booking);

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new BadRequestException(
        'You can only submit feedback for your own bookings',
      );
    }

    console.log('[FeedbackService] Trip status:', booking.trip.status);
    // Check if trip is completed
    if (booking.trip.status !== 'completed') {
      throw new BadRequestException(
        'You can only submit feedback for completed trips',
      );
    }

    // Check if feedback already exists
    console.log('[FeedbackService] Checking for existing feedback...');
    const existingFeedback = await this.feedbackRepository.findByBookingId(
      dto.bookingId,
    );
    console.log('[FeedbackService] Existing feedback:', !!existingFeedback);
    
    if (existingFeedback) {
      throw new BadRequestException(
        'Feedback already submitted for this booking',
      );
    }

    // Upload photos if provided
    let photoUrls: string[] = [];
    if (photos && photos.length > 0) {
      console.log('[FeedbackService] Uploading photos:', photos.length);
      
      // Validate accepted image types
      const acceptedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/svg+xml',
      ];

      for (const photo of photos) {
        if (!acceptedTypes.includes(photo.mimetype)) {
          throw new BadRequestException(
            'Only JPEG, PNG, WebP, and SVG images are allowed',
          );
        }
      }

      // Upload each photo to R2 storage
      const uploadPromises = photos.map((photo, index) => {
        console.log(`[FeedbackService] Uploading photo ${index + 1}...`);
        return this.mediaService.uploadFormData(photo, {
          domain: MediaDomain.FEEDBACK,
          domainId: dto.bookingId,
          type: MediaType.IMAGE,
        });
      });

      const uploadedMedia = await Promise.all(uploadPromises);
      photoUrls = uploadedMedia.map((media) => media.url);
      console.log('[FeedbackService] Photos uploaded:', photoUrls.length);
    }

    // Create feedback with photo URLs
    console.log('[FeedbackService] Creating feedback in database...');
    const feedback = await this.feedbackRepository.createFeedback(
      userId,
      booking.tripId,
      {
        ...dto,
        photos: photoUrls,
      },
    );
    console.log('[FeedbackService] Feedback created:', feedback.id);

    // Update trip status to archived
    console.log('[FeedbackService] Updating trip status to archived...');
    await this.tripRepository.update(booking.tripId, { status: 'archived' });
    console.log('[FeedbackService] Trip status updated to archived');

    return {
      id: feedback.id,
      bookingId: feedback.bookingId,
      rating: feedback.rating,
      recommendation: feedback.recommendation,
      comment: feedback.comment,
      photos: feedback.photos,
      submittedAt: feedback.submittedAt,
    };
  }

  async getFeedbackByBooking(bookingId: string) {
    return this.feedbackRepository.findByBookingId(bookingId);
  }

  async getFeedbackByTrip(tripId: string) {
    return this.feedbackRepository.findByTripId(tripId);
  }

  async getFeedbackByUser(userId: string) {
    const feedbacks = await this.feedbackRepository.findByUserId(userId);
    return feedbacks.map((feedback) => ({
      id: feedback.id,
      bookingId: feedback.bookingId,
      rating: feedback.rating,
      recommendation: feedback.recommendation,
      comment: feedback.comment,
      photos: feedback.photos,
      submittedAt: feedback.submittedAt,
      trip: {
        id: feedback.trip.id,
        origin: feedback.trip.route.origin,
        destination: feedback.trip.route.destination,
        departureTime: feedback.trip.departureTime,
        status: feedback.trip.status,
      },
    }));
  }
}
