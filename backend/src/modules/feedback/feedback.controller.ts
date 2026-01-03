import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { ActiveUser } from '../auth/decorator/active-user.decorator';
import type { ActiveUserData } from '../auth/interfaces/active-user-data.interface';
import type { Express } from 'express';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @Auth(AuthType.Bearer)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit feedback for a completed trip' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('photos', 5))
  @ApiBody({
    description: 'Feedback data with optional photos',
    schema: {
      type: 'object',
      properties: {
        bookingId: {
          type: 'string',
          format: 'uuid',
          description: 'Booking ID',
        },
        rating: {
          type: 'integer',
          minimum: 1,
          maximum: 5,
          description: 'Trip rating (1-5)',
        },
        recommendation: {
          type: 'integer',
          minimum: 1,
          maximum: 10,
          description: 'Recommendation score (1-10)',
        },
        comment: {
          type: 'string',
          minLength: 10,
          maxLength: 1000,
          description: 'Feedback comment',
        },
        photos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 5,
          description: 'Photos (max 5, only JPEG/PNG/WebP/SVG)',
        },
      },
      required: ['bookingId', 'rating', 'recommendation', 'comment'],
    },
  })
  async createFeedback(
    @ActiveUser() user: ActiveUserData,
    @Body() dto: CreateFeedbackDto,
    @UploadedFiles() photos?: Express.Multer.File[],
  ) {
    console.log('[FeedbackController] Received feedback request', {
      userId: user.sub,
      dto,
      photosCount: photos?.length || 0,
    });
    
    try {
      const result = await this.feedbackService.createFeedback(user.sub, dto, photos);
      console.log('[FeedbackController] Feedback created successfully');
      return result;
    } catch (error) {
      console.error('[FeedbackController] Error creating feedback:', error);
      throw error;
    }
  }

  @Get('booking/:bookingId')
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Get feedback by booking ID' })
  @ApiParam({ name: 'bookingId', type: 'string', format: 'uuid' })
  async getFeedbackByBooking(@Param('bookingId') bookingId: string) {
    return this.feedbackService.getFeedbackByBooking(bookingId);
  }

  @Get('trip/:tripId')
  @Auth(AuthType.None)
  @ApiOperation({ summary: 'Get all feedback for a trip' })
  @ApiParam({ name: 'tripId', type: 'string', format: 'uuid' })
  async getFeedbackByTrip(@Param('tripId') tripId: string) {
    return this.feedbackService.getFeedbackByTrip(tripId);
  }
}
