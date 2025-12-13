import { payosConfig } from '@/config/payment.config';
import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { PayOS, Webhook } from '@payos/node';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { BookingService } from '@/modules/booking/booking.service';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { PaymentRepository } from '../payment.repository';
import { PaymentStatus } from '../entities/payment.entity';
import { PaymentEmailProvider } from './payment-email.provider';

@Injectable()
export class PaymentService {
  private readonly payosClient: PayOS;
  constructor(
    @Inject(payosConfig.KEY)
    private readonly payosConfiguration: ConfigType<typeof payosConfig>,
    private readonly bookingService: BookingService,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentEmailProvider: PaymentEmailProvider,
  ) {
    this.payosClient = new PayOS({
      clientId: this.payosConfiguration.clientId,
      apiKey: this.payosConfiguration.apiKey,
      checksumKey: this.payosConfiguration.checksumKey,
      baseURL: 'https://api-merchant.payos.vn',
      logger: console,
      logLevel: 'debug',
    });
  }

  public async createBookingPayment(bookingId: string) {
    const booking = await this.bookingService.getBookingDetail(bookingId);

    if (booking.status !== 'pending') {
      throw new BadRequestException('Booking is not in pending state');
    }
    const orderCode = Number(`${Date.now()}`.slice(-9));

    const amount = Math.round(Number(booking.totalAmount));

    //create payment session with payos

    const payload: CreatePaymentDto = {
      orderCode: orderCode,
      amount: 5000, //temporarily min amount 10,000 VND for sandbox testing
      description: `Payment for booking`,
      returnUrl:
        this.payosConfiguration.returnUrl ||
        'https://your-frontend/checkout-result',
      cancelUrl:
        this.payosConfiguration.cancelUrl ||
        'https://your-frontend/checkout-result',
    };
    try {
      console.log('payload for payment: ', payload);
      const response = await this.payosClient.paymentRequests.create(payload);
      console.log('response from payos: ', response);

      const paymentLinkId = response.paymentLinkId;

      //create payment record in db
      await this.paymentRepository.createPayment({
        bookingId: booking.id,
        orderCode: orderCode,
        amount: amount,
        provider: 'PAYOS',
        currency: 'VND',
        paymentLinkId, //to set later when have payment link
      });

      return response;
    } catch {
      throw new BadRequestException('Failed to create payment session');
    }
  }

  //use in case you want to verify webhook signature manually, dont use guard
  private async verifyWebhookSignature(webhook: Webhook) {
    const webhookData = await this.payosClient.webhooks.verify(webhook);
    return webhookData;
  }

  public async handlePaymentWebhook(webhook: Webhook) {
    // Process the webhook data as needed

    const webhookData = await this.verifyWebhookSignature(webhook);

    // TODO:
    // 1. Tìm payment record theo providerOrderCode = data.orderCode
    const payment = await this.paymentRepository.findOneByOrderCode(
      webhookData.orderCode,
    );
    if (!payment) {
      console.warn('Payment not found', webhookData.orderCode);
      return { received: true };
    }

    //idopement check
    if (payment?.status === PaymentStatus.PAID) {
      // webhook này đã được xử lý trước đó rồi
      return { received: true };
    }

    // 3. Update payment.status = 'PAID'
    if (webhookData.code === '00') {
      const payment = await this.paymentRepository.updatePayment({
        orderCode: webhookData.orderCode,
        transactionRef: webhookData.reference,
        status: PaymentStatus.PAID,
      });
      // 4. Update booking.status = 'paid'
      if (payment) {
        await this.bookingService.updateBookingStatus(
          payment.bookingId,
          'paid',
        );
      }
    }

    // 4. sending complete payment email
    console.log('sending email : ', payment.booking);
    await this.paymentEmailProvider.sendPaymentSuccessEmail(
      payment.booking.user.email,
      payment.booking.bookingReference || payment.booking.id,
      payment.orderCode,
      payment.amount,
      webhookData.reference,
    );

    return { received: true }; // Acknowledge receipt of the webhook
  }

  public async confirmWebhookPayment(webhookUrl: string) {
    const url = webhookUrl;
    if (!url) {
      throw new Error('PAYOS webhookUrl is not configured');
    }

    const res = await this.payosClient.webhooks.confirm(url);
    return res;
  }

  //method for cron job to check and update payment status
  public async checkAndUpdatePendingPayments() {
    //calculate cutoff date 10 minutes ago
    const cutoffDate = new Date(Date.now() - 10 * 60 * 1000);

    //fetch all pending payments from db
    const pendingPayments =
      await this.paymentRepository.findPendingPaymentsBefore(cutoffDate);

    let updatedCount = 0;
    for (const payment of pendingPayments) {
      await this.paymentRepository.updatePayment({
        orderCode: payment.orderCode,
        transactionRef: payment.transactionRef,
        status: PaymentStatus.EXPIRED,
      });
      updatedCount++;
    }

    return { updated: updatedCount };
  }
}
