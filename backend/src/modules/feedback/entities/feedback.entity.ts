import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Trip } from '@/modules/trip/entities/trip.entity';
import { User } from '@/modules/users/entities/user.entity';

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

  @Column()
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'timestamp' })
  submittedAt: Date;

  @ManyToOne(() => Trip, (trip) => trip.feedbacks, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  trip: Trip;

  @ManyToOne(() => User, (user) => user.feedbacks, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  user: User;
}
