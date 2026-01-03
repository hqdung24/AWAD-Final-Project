import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectRepository(Feedback)
    private readonly repository: Repository<Feedback>,
  ) {}

  async createFeedback(
    userId: string,
    tripId: string,
    dto: CreateFeedbackDto,
  ): Promise<Feedback> {
    const feedback = this.repository.create({
      userId,
      tripId,
      bookingId: dto.bookingId,
      rating: dto.rating,
      recommendation: dto.recommendation,
      comment: dto.comment,
      photos: dto.photos || [],
    });

    return this.repository.save(feedback);
  }

  async findByBookingId(bookingId: string): Promise<Feedback | null> {
    return this.repository.findOne({
      where: { bookingId },
      relations: ['user'],
    });
  }

  async findByTripId(tripId: string): Promise<Feedback[]> {
    return this.repository.find({
      where: { tripId },
      relations: ['user'],
      order: { submittedAt: 'DESC' },
    });
  }
}
