import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Trip } from '@/modules/trip/entities/trip.entity';
import { PassengerDetail } from '@/modules/passenger-detail/entities/passenger-detail.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';
import { Notification } from '@/modules/notification/entities/notification.entity';
import { SeatStatus } from '@/modules/seat-status/entities/seat-status.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  tripId: string;

  @Column()
  status: string; // pending / paid / cancelled / expired

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @CreateDateColumn()
  bookedAt: Date;

  @ManyToOne(() => User, (user) => user.bookings, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Trip, (trip) => trip.bookings, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  trip: Trip;

  @OneToMany(
    () => PassengerDetail,
    (passengerDetail) => passengerDetail.booking,
  )
  passengerDetails: PassengerDetail[];

  @OneToMany(() => Payment, (payment) => payment.booking)
  payments: Payment[];

  @OneToMany(() => Notification, (notification) => notification.booking)
  notifications: Notification[];

  @OneToMany(() => SeatStatus, (seatStatus) => seatStatus.booking)
  seatStatuses: SeatStatus[];
}
