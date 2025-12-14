import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {}

  /**
   * Create a new payment attempt for a booking
   */
  async createPayment(params: {
    bookingId: string;
    orderCode: number;
    amount: number;
    provider: string; // 'PAYOS'
    currency?: string;
    paymentLinkId?: string;
  }): Promise<Payment> {
    const payment = this.repository.create({
      bookingId: params.bookingId,
      orderCode: params.orderCode,
      amount: params.amount,
      provider: params.provider,
      currency: params.currency ?? 'VND',
      paymentLinkId: params.paymentLinkId,
      status: PaymentStatus.PENDING,
    });

    return this.repository.save(payment);
  }

  async updatePayment(params: {
    orderCode: number;
    transactionRef?: string | null;
    status: PaymentStatus;
  }): Promise<Payment | null> {
    const payment = await this.repository.findOne({
      where: { orderCode: params.orderCode },
    });

    if (!payment) {
      return null; // hoặc throw nếu bạn muốn strict
    }

    // idempotency: webhook retry thì bỏ qua
    if (payment.status === PaymentStatus.PAID) {
      return payment;
    }

    payment.status = params.status;
    payment.transactionRef = params.transactionRef ?? payment.transactionRef;
    if (params.status === PaymentStatus.PAID) {
      payment.paidAt = new Date();
    }

    return this.repository.save(payment);
  }

  async findOneByOrderCode(orderCode: number): Promise<Payment | null> {
    return this.repository.findOne({
      where: { orderCode },
      relations: [
        'booking',
        'booking.user',
        'booking.trip',
        'booking.trip.route',
        'booking.seatStatuses',
        'booking.seatStatuses.seat',
        'booking.passengerDetails',
      ],
    });
  }

  async findPendingPaymentsBefore(date: Date): Promise<Payment[]> {
    return this.repository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .where('payment.status = :status', { status: PaymentStatus.PENDING })
      .andWhere('payment.createdAt < :date', { date })
      .getMany();
  }
}
