import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Booking } from '@/modules/booking/entities/booking.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  bookingId: string;

  @Column()
  provider: string;

  @Column()
  transactionRef: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  status: string; // success / failed / pending

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @ManyToOne(() => Booking, (booking) => booking.payments, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
