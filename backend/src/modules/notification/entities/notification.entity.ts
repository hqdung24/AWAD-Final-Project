import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { Booking } from '@/modules/booking/entities/booking.entity';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../enums/notification.enum';
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string; // important for in-app notifications

  @Column({
    type: 'enum',
    enum: NotificationChannel,
  })
  channel: NotificationChannel;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;
  // example: { bookingId, oldStatus, newStatus }

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date; // for in-app notifications

  @ManyToOne(() => Booking, (booking) => booking.notifications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  booking?: Booking;
}
