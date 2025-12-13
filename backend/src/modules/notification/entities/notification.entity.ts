import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Booking } from '@/modules/booking/entities/booking.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  bookingId: string;

  @Column()
  channel: string; // email / sms / in-app

  @Column()
  template: string;

  @Column()
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  @ManyToOne(() => Booking, (booking) => booking.notifications, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  booking: Booking;
}
