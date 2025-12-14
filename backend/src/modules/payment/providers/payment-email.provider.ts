import { appConfig } from '@/config/app.config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { Resend } from 'resend';
import {
  PAYMENT_EMAIL_SUBJECTS,
  type PaymentFailedParams,
  type PaymentInitiatedParams,
  type PaymentSuccessParams,
  getPaymentInitiatedTemplate,
  getPaymentSuccessTemplate,
  getPaymentFailedTemplate,
} from '../constant/email.constant';

@Injectable()
export class PaymentEmailProvider {
  private readonly logger = new Logger(PaymentEmailProvider.name);

  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
  ) {}

  async sendPaymentInitiatedEmail(
    toAddress: string,
    payload: PaymentInitiatedParams,
  ): Promise<void> {
    try {
      const resend = new Resend(this.appConfiguration.resendApiKey);
      const html = getPaymentInitiatedTemplate(payload);

      await resend.emails.send({
        from: `Bus Ticket <${this.appConfiguration.adminEmailAddress}>`,
        to: toAddress,
        subject: PAYMENT_EMAIL_SUBJECTS.PAYMENT_INITIATED,
        html,
      });

      this.logger.log(
        `Payment initiated email sent to ${toAddress} for booking ${payload.bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment initiated email to ${toAddress}: ${(error as Error).message}`,
      );
    }
  }

  async sendPaymentSuccessEmail(
    toAddress: string,
    payload: PaymentSuccessParams,
  ): Promise<void> {
    try {
      const html = getPaymentSuccessTemplate(payload);

      const resend = new Resend(this.appConfiguration.resendApiKey);

      await resend.emails.send({
        from: `Bus Ticket <${this.appConfiguration.adminEmailAddress}>`,
        to: toAddress,
        subject: PAYMENT_EMAIL_SUBJECTS.PAYMENT_SUCCESS,
        html,
      });

      this.logger.log(
        `Payment success email sent to ${toAddress} for booking ${payload.bookingReference || payload.bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment success email to ${toAddress}: ${(error as Error).message}`,
      );
    }
  }

  async sendPaymentFailedEmail(
    toAddress: string,
    payload: PaymentFailedParams,
  ): Promise<void> {
    try {
      const resend = new Resend(this.appConfiguration.resendApiKey);
      const html = getPaymentFailedTemplate(payload);

      await resend.emails.send({
        from: `Bus Ticket <${this.appConfiguration.adminEmailAddress}>`,
        to: toAddress,
        subject: PAYMENT_EMAIL_SUBJECTS.PAYMENT_FAILED,
        html,
      });

      this.logger.log(
        `Payment failed email sent to ${toAddress} for booking ${payload.bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment failed email to ${toAddress}: ${(error as Error).message}`,
      );
    }
  }
}
