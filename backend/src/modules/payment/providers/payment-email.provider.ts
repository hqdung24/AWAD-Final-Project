import { appConfig } from '@/config/app.config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { Resend } from 'resend';
import {
  PAYMENT_EMAIL_SUBJECTS,
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
    bookingId: string,
    orderCode: number,
    amount: number,
    checkoutUrl: string,
  ): Promise<void> {
    try {
      const resend = new Resend(this.appConfiguration.resendApiKey);
      const html = getPaymentInitiatedTemplate(
        bookingId,
        orderCode,
        amount,
        checkoutUrl,
      );

      await resend.emails.send({
        from: `Bus Ticket <${this.appConfiguration.adminEmailAddress}>`,
        to: toAddress,
        subject: PAYMENT_EMAIL_SUBJECTS.PAYMENT_INITIATED,
        html,
      });

      this.logger.log(
        `Payment initiated email sent to ${toAddress} for booking ${bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment initiated email to ${toAddress}: ${(error as Error).message}`,
      );
    }
  }

  async sendPaymentSuccessEmail(
    toAddress: string,
    bookingReference: string,
    orderCode: number,
    amount: number,
    transactionRef: string,
  ): Promise<void> {
    try {
      const html = getPaymentSuccessTemplate(
        bookingReference,
        orderCode,
        amount,
        transactionRef,
      );

      const resend = new Resend(this.appConfiguration.resendApiKey);

      await resend.emails.send({
        from: `Bus Ticket <${this.appConfiguration.adminEmailAddress}>`,
        to: toAddress,
        subject: PAYMENT_EMAIL_SUBJECTS.PAYMENT_SUCCESS,
        html,
      });

      this.logger.log(
        `Payment success email sent to ${toAddress} for booking ${bookingReference}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment success email to ${toAddress}: ${(error as Error).message}`,
      );
    }
  }

  async sendPaymentFailedEmail(
    toAddress: string,
    bookingId: string,
    orderCode: number,
    amount: number,
  ): Promise<void> {
    try {
      const resend = new Resend(this.appConfiguration.resendApiKey);
      const html = getPaymentFailedTemplate(bookingId, orderCode, amount);

      await resend.emails.send({
        from: `Bus Ticket <${this.appConfiguration.adminEmailAddress}>`,
        to: toAddress,
        subject: PAYMENT_EMAIL_SUBJECTS.PAYMENT_FAILED,
        html,
      });

      this.logger.log(
        `Payment failed email sent to ${toAddress} for booking ${bookingId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment failed email to ${toAddress}: ${(error as Error).message}`,
      );
    }
  }
}
