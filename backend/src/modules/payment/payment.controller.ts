import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { CreatePaymentSession } from './dtos/create-payment-session.request';
import { PaymentService } from './providers/payment.service';
import { type Webhook } from '@payos/node';
import { AuthType } from '../auth/enums/auth-type.enum';
import { Auth } from '../auth/decorator/auth.decorator';
import { CreatePaymentLinkResponse } from '@payos/node';
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @Auth(AuthType.None) // Public access for now
  async createPayment(@Body() body: CreatePaymentSession) {
    const bookingId = body.bookingId;
    const payment: CreatePaymentLinkResponse =
      await this.paymentService.createBookingPayment(bookingId);

    return payment;
  }

  @Post('/webhook')
  @HttpCode(200)
  @Auth(AuthType.None) // Public access for now
  async handleWebhook(@Body() body: Webhook) {
    // Implementation for handling payment gateway webhooks
    return this.paymentService.handlePaymentWebhook(body);
  }

  //only run this endpoint to confirm webhook url once
  @Post('/webhook/confirm')
  @Auth(AuthType.None) // Public access for now
  async confirmWebhook(@Body() body: { webhookUrl: string }) {
    return this.paymentService.confirmWebhookPayment(body.webhookUrl);
  }
}
