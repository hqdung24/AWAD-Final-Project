import { Booking } from '@/modules/booking/entities/booking.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

@Entity('payments')
@Index(['orderCode'], { unique: true })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ===== PayOS fields =====
  @Column()
  orderCode: number; // PayOS orderCode

  @Column({ nullable: true })
  paymentLinkId: string; // PayOS paymentLinkId

  @Column()
  provider: string; // PAYOS

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'VND' })
  currency: string;

  // ===== Webhook result =====
  @Column({ nullable: true })
  transactionRef: string; // reference từ ngân hàng

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date;

  // ===== Relation =====
  @Column()
  @Index()
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.payments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  booking: Booking;

  // ===== Meta =====
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
