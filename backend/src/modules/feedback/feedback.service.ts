import { Injectable } from '@nestjs/common';
import { FeedbackRepository } from './feedback.repository';

@Injectable()
export class FeedbackService {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}
}
