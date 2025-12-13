import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Route } from '@/modules/route/entities/route.entity';
import { Bus } from '@/modules/bus/entities/bus.entity';
import { Booking } from '@/modules/booking/entities/booking.entity';
import { SeatStatus } from '@/modules/seat-status/entities/seat-status.entity';
import { Feedback } from '@/modules/feedback/entities/feedback.entity';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  routeId: string;

  @Column()
  @Index()
  busId: string;

  @Column({ type: 'timestamptz' })
  departureTime: Date;

  @Column({ type: 'timestamptz' })
  arrivalTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column()
  status: string; // scheduled / cancelled / completed / archived

  @ManyToOne(() => Route, (route) => route.trips, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  route: Route;

  @ManyToOne(() => Bus, (bus) => bus.trips, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  bus: Bus;

  @OneToMany(() => Booking, (booking) => booking.trip)
  bookings: Booking[];

  @OneToMany(() => SeatStatus, (seatStatus) => seatStatus.trip)
  seatStatuses: SeatStatus[];

  @OneToMany(() => Feedback, (feedback) => feedback.trip)
  feedbacks: Feedback[];
}
