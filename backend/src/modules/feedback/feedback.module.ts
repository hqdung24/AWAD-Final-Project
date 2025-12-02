import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { FeedbackRepository } from './feedback.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackRepository],
  exports: [FeedbackService, FeedbackRepository],
})
export class FeedbackModule {}
