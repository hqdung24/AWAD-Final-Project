import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Trip } from '@/modules/trip/entities/trip.entity';
import { User } from '@/modules/users/entities/user.entity';
import { Booking } from '@/modules/booking/entities/booking.entity';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tripId: string;

  @Column()
  @Index()
  userId: string;

  @Column({ nullable: true })
  @Index()
  bookingId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'int' })
  recommendation: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'jsonb', nullable: true })
  photos: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  submittedAt: Date;

  @ManyToOne(() => Trip, { onDelete: 'RESTRICT' })
  @JoinColumn()
  trip: Trip;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn()
  booking: Booking;
}
