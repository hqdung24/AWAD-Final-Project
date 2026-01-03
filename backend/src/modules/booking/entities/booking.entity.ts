import { Notification } from '@/modules/notification/entities/notification.entity';
import { PassengerDetail } from '@/modules/passenger-detail/entities/passenger-detail.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';
import { SeatStatus } from '@/modules/seat-status/entities/seat-status.entity';
import { Trip } from '@/modules/trip/entities/trip.entity';
import { User } from '@/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('bookings')
@Index(['bookingReference'], { unique: true })
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //nullable userId to allow guest bookings
  @Column({ nullable: true })
  @Index()
  userId: string | null;

  @Column()
  @Index()
  tripId: string;

  @Column()
  status: string; // pending / paid / cancelled / expired / reviewed

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  bookedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  reminder24hSentAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  reminder3hSentAt: Date | null;

  //Contact info
  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'uuid', nullable: true })
  pickupPointId: string | null;

  @Column({ type: 'uuid', nullable: true })
  dropoffPointId: string | null;

  @Column({ type: 'varchar', nullable: true })
  ticketToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  ticketTokenIssuedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  checkedInAt: Date | null;

  @ManyToOne(() => User, (user) => user.bookings, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  user: User;

  @Column({ type: 'varchar' })
  bookingReference: string; //user-friendly booking reference code

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
