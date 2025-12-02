import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Booking } from '@/modules/booking/entities/booking.entity';

@Entity('passenger_details')
export class PassengerDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  bookingId: string;

  @Column()
  fullName: string;

  @Column()
  documentId: string;

  @Column()
  seatCode: string;

  @ManyToOne(() => Booking, (booking) => booking.passengerDetails, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;
}
