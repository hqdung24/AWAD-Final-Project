import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Operator } from '@/modules/operator/entities/operator.entity';
import { Seat } from '@/modules/seat/entities/seat.entity';
import { Trip } from '@/modules/trip/entities/trip.entity';

@Entity('buses')
export class Bus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  operatorId: string;

  @Column()
  plateNumber: string;

  @Column()
  model: string;

  @Column({ nullable: true })
  busType: string; // Seat, Sleeper, VIP Sleeper, Limousine

  @Column()
  seatCapacity: number;

  @Column({ type: 'text', nullable: true })
  amenitiesJson: string;

  @Column({ type: 'text', nullable: true })
  photosJson: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Operator, (operator) => operator.buses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  operator: Operator;

  @OneToMany(() => Seat, (seat) => seat.bus)
  seats: Seat[];

  @OneToMany(() => Trip, (trip) => trip.bus)
  trips: Trip[];
}
