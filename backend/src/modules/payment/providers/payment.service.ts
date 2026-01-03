/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { payosConfig } from '@/config/payment.config';
import { appConfig } from '@/config/app.config';
import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { PayOS, Webhook } from '@payos/node';
import QRCode from 'qrcode';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { BookingService } from '@/modules/booking/booking.service';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { PaymentRepository } from '../payment.repository';
import { PaymentStatus } from '../entities/payment.entity';
import type { Booking } from '@/modules/booking/entities/booking.entity';
import type { Payment } from '../entities/payment.entity';
import { PaymentEmailProvider } from './payment-email.provider';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationType } from '@/modules/notification/enums/notification.enum';
import type { NotificationCreateEventPayload } from '@/modules/notification/dto/notification-event.dto';

@Injectable()
export class PaymentService {
  private readonly payosClient: PayOS;
  constructor(
    @Inject(payosConfig.KEY)
    private readonly payosConfiguration: ConfigType<typeof payosConfig>,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    private readonly bookingService: BookingService,
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentEmailProvider: PaymentEmailProvider,
    private readonly eventEmitter: EventEmitter2,
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

  private buildContact(booking: Booking) {
    const fullName = booking.name
      ? booking.name
      : [booking.user?.firstName, booking.user?.lastName]
          .filter(Boolean)
          .join(' ');

    return {
      name: fullName || null,
      email: booking.email || booking.user?.email || null,
      phone: booking.phone || booking.user?.phone || null,
    };
  }

  private buildPassengers(booking: Booking) {
    return (
      booking.passengerDetails?.map((p) => ({
        fullName: p.fullName,
        seatCode: p.seatCode,
        documentId: p.documentId,
      })) ?? []
    );
  }

  private buildSeats(booking: Booking) {
    return (
      booking.seatStatuses?.map((s) => s.seat?.seatCode).filter(Boolean) ?? []
    );
  }

  private buildManageBookingUrl(bookingId: string) {
    const base = this.appConfiguration.frontendUrl?.replace(/\/$/, '');
    if (!base) return undefined;
    return `${base}/upcoming-trip/${bookingId}`;
  }

  private buildPaymentInitiatedPayload(
    booking: Booking,
    payment: Payment,
    checkoutUrl: string,
  ) {
    return {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      origin: booking.trip?.route?.origin || '—',
      destination: booking.trip?.route?.destination || '—',
      departureTime: booking.trip?.departureTime?.toISOString?.() || '',
      arrivalTime: booking.trip?.arrivalTime?.toISOString?.(),
      seats: this.buildSeats(booking),
      passengers: this.buildPassengers(booking),
      contact: this.buildContact(booking),
      amount: Number(payment.amount),
      orderCode: payment.orderCode,
      checkoutUrl,
      paymentDeadline: new Date(
        booking.bookedAt.getTime() + 12 * 60 * 60 * 1000,
      ).toISOString(),
      manageBookingUrl: this.buildManageBookingUrl(booking.id),
    };
  }

  private async buildPaymentSuccessPayload(
    booking: Booking,
    payment: Payment,
    transactionRef: string,
  ) {
    const base = this.appConfiguration.frontendUrl?.replace(/\/$/, '');
    const verifyTicketUrl =
      base && booking.ticketToken
        ? `${base}/ticket/verify/${booking.ticketToken}`
        : undefined;

    let verifyTicketQrBase64: string | undefined;
    if (verifyTicketUrl) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        verifyTicketQrBase64 = await (QRCode as any).toDataURL(
          verifyTicketUrl,
          {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 200,
          },
        );
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    }

    return {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      origin: booking.trip?.route?.origin || '—',
      destination: booking.trip?.route?.destination || '—',
      departureTime: booking.trip?.departureTime?.toISOString?.() || '',
      arrivalTime: booking.trip?.arrivalTime?.toISOString?.(),
      seats: this.buildSeats(booking),
      passengers: this.buildPassengers(booking),
      contact: this.buildContact(booking),
      amount: Number(payment.amount),
      orderCode: payment.orderCode,
      transactionRef,
      verifyTicketUrl,
      verifyTicketQrBase64,
      manageBookingUrl: this.buildManageBookingUrl(booking.id),
    };
  }

  private buildPaymentFailedPayload(booking: Booking, payment: Payment) {
    return {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      origin: booking.trip?.route?.origin || '—',
      destination: booking.trip?.route?.destination || '—',
      departureTime: booking.trip?.departureTime?.toISOString?.() || '',
      arrivalTime: booking.trip?.arrivalTime?.toISOString?.(),
      seats: this.buildSeats(booking),
      passengers: this.buildPassengers(booking),
      contact: this.buildContact(booking),
      amount: Number(payment.amount),
      orderCode: payment.orderCode,
      manageBookingUrl: this.buildManageBookingUrl(booking.id),
    };
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
      const paymentRecord = await this.paymentRepository.createPayment({
        bookingId: booking.id,
        orderCode: orderCode,
        amount: amount,
        provider: 'PAYOS',
        currency: 'VND',
        paymentLinkId, //to set later when have payment link
      });

      // Best-effort payment initiation email
      const checkoutUrl: string =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (response as any).checkoutUrl ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (response as any).paymentLink ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (response as any).shortLink ||
        '';

      const to = booking.email || booking.user?.email;
      if (checkoutUrl && to) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.paymentEmailProvider.sendPaymentInitiatedEmail(
          to,
          this.buildPaymentInitiatedPayload(
            booking,
            paymentRecord,
            checkoutUrl,
          ),
        );
      }

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

    if (webhookData.code === '00') {
      const updatedPayment = await this.paymentRepository.updatePayment({
        orderCode: webhookData.orderCode,
        transactionRef: webhookData.reference,
        status: PaymentStatus.PAID,
      });

      if (updatedPayment) {
        await this.bookingService.updateBookingStatus(
          updatedPayment.bookingId,
          'paid',
        );
      }

      const bookingDetail = await this.bookingService.getBookingDetail(
        payment.bookingId,
      );
      const to =
        bookingDetail.email ||
        bookingDetail.user?.email ||
        payment.booking.user?.email;

      if (to) {
        const emailPayload = await this.buildPaymentSuccessPayload(
          bookingDetail,
          updatedPayment || payment,
          webhookData.reference,
        );
        await this.paymentEmailProvider.sendPaymentSuccessEmail(
          to,
          emailPayload,
        );
      }

      // Emit booking confirmation notification event
      if (bookingDetail.userId) {
        const notificationPayload: NotificationCreateEventPayload = {
          userId: bookingDetail.userId,
          type: NotificationType.BOOKING_CONFIRMATION,
          payload: {
            bookingId: bookingDetail.id,
            tripId: bookingDetail.tripId,
            bookingRef: bookingDetail.bookingReference,
            totalAmount: Number(updatedPayment?.amount || payment.amount),
            currency: 'VND',
            seats: this.buildSeats(bookingDetail),
            departureTime:
              bookingDetail.trip?.departureTime?.toISOString?.() || '',
          },
        };
        this.eventEmitter.emit('notification.create', notificationPayload);
      }
    } else {
      const updatedPayment = await this.paymentRepository.updatePayment({
        orderCode: webhookData.orderCode,
        transactionRef: webhookData.reference,
        status: PaymentStatus.FAILED,
      });

      const bookingDetail = await this.bookingService.getBookingDetail(
        payment.bookingId,
      );
      const to =
        bookingDetail.email ||
        bookingDetail.user?.email ||
        payment.booking.user?.email;

      if (to) {
        await this.paymentEmailProvider.sendPaymentFailedEmail(
          to,
          this.buildPaymentFailedPayload(
            bookingDetail,
            updatedPayment || payment,
          ),
        );
      }
    }
    // Emit event for create notification

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
