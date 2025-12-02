import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Trip } from '@/modules/trip/entities/trip.entity';
import { Seat } from '@/modules/seat/entities/seat.entity';
import { Booking } from '@/modules/booking/entities/booking.entity';

@Entity('seat_statuses')
export class SeatStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  tripId: string;

  @Column()
  @Index()
  seatId: string;

  @Column()
  state: string; // available / locked / booked

  @Column({ nullable: true, type: 'uuid', default: null })
  bookingId: string;

  @Column({ type: 'timestamp', nullable: true, default: null })
  lockedUntil: Date;

  @ManyToOne(() => Trip, (trip) => trip.seatStatuses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  trip: Trip;

  @ManyToOne(() => Seat, (seat) => seat.seatStatuses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  seat: Seat;

  @ManyToOne(() => Booking, (booking) => booking.seatStatuses, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  @JoinColumn()
  booking: Booking;
}
