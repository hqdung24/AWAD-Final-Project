import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PaymentMethod } from '@/modules/payment-method/entities/payment-method.entity';
import { Booking } from '@/modules/booking/entities/booking.entity';
import { Feedback } from '@/modules/feedback/entities/feedback.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 15, nullable: true, unique: true })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, select: false })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  googleId: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  username?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 20, default: 'USER' })
  role: string;

  @Column({ type: 'boolean', default: false })
  isVerified?: boolean;

  @Column({ type: 'boolean', default: true })
  isActive?: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true, default: null })
  verificationToken?: string | null;

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user)
  paymentMethods: PaymentMethod[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date;

  // Relations
}
