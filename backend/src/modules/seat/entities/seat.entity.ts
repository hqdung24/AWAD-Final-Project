import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Bus } from '@/modules/bus/entities/bus.entity';
import { SeatStatus } from '@/modules/seat-status/entities/seat-status.entity';

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  busId: string;

  @Column()
  seatCode: string;

  @Column()
  seatType: string; // standard / vip / window / aisle

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Bus, (bus) => bus.seats, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  bus: Bus;

  @OneToMany(() => SeatStatus, (seatStatus) => seatStatus.seat)
  seatStatuses: SeatStatus[];
}
