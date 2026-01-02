import { appConfig } from '@/config/app.config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { Resend } from 'resend';
import {
  BOOKING_EMAIL_SUBJECTS,
  type BookingConfirmationParams,
  type BookingCancelledParams,
  type TripReminderParams,
  getBookingConfirmationTemplate,
  getBookingCancelledTemplate,
  getTripReminderTemplate,
} from '../constant/email.constant';

@Injectable()
export class BookingEmailProvider {
  private readonly logger = new Logger(BookingEmailProvider.name);

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  async sendBookingConfirmationEmail(
    toAddress: string,
    payload: BookingConfirmationParams,
  ): Promise<void> {
    try {
      const resend = new Resend(this.appConfiguration.resendApiKey);

      const emailContent = getBookingConfirmationTemplate(payload);

      await resend.emails.send({
        from: `Bus Ticket <${this.appConfiguration.adminEmailAddress}>`,
        to: toAddress,
        subject: BOOKING_EMAIL_SUBJECTS.BOOKING_CONFIRMATION,
        html: emailContent,
      });

      this.logger.log(
        `Booking confirmation email sent to ${toAddress} for booking ${payload.bookingId}`,
      );
    } catch (error) {
      // Log error but don't throw - email is non-critical
      this.logger.error(
        `Failed to send booking confirmation email to ${toAddress}: ${(error as Error).message}`,
      );
    }
  }

  async sendTripReminderEmail(
    toAddress: string,
    payload: TripReminderParams,
  ): Promise<void> {
    try {
      const resend = new Resend(this.appConfiguration.resendApiKey);
      const emailContent = getTripReminderTemplate(payload);

      await resend.emails.send({
        from: `Bus Ticket <${this.appConfiguration.adminEmailAddress}>`,
        to: toAddress,
        subject: BOOKING_EMAIL_SUBJECTS.TRIP_REMINDER,
        html: emailContent,
      });

      this.logger.log(
        `Trip reminder (${payload.reminderType}) sent to ${toAddress} for booking ${payload.bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send trip reminder (${payload.reminderType}) to ${toAddress}: ${(error as Error).message}`,
      );
    }
  }

  async sendBookingCancelledEmail(
    toAddress: string,
    payload: BookingCancelledParams,
  ): Promise<void> {
    try {
      const resend = new Resend(this.appConfiguration.resendApiKey);
      const emailContent = getBookingCancelledTemplate(payload);

      await resend.emails.send({
        from: `Bus Ticket <${this.appConfiguration.adminEmailAddress}>`,
        to: toAddress,
        subject: BOOKING_EMAIL_SUBJECTS.BOOKING_CANCELLED,
        html: emailContent,
      });

      this.logger.log(
        `Booking cancelled email sent to ${toAddress} for booking ${payload.bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send booking cancelled email to ${toAddress}: ${(error as Error).message}`,
      );
    }
  }
}
