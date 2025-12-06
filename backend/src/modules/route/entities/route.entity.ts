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
import { Trip } from '@/modules/trip/entities/trip.entity';
import { RoutePoint } from './route-point.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  operatorId: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column()
  distanceKm: number;

  @Column()
  estimatedMinutes: number;

  @Column({ nullable: true })
  notes?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Operator, (operator) => operator.routes, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  operator: Operator;

  @OneToMany(() => Trip, (trip) => trip.route)
  trips: Trip[];

  @OneToMany(() => RoutePoint, (routePoint) => routePoint.route, {
    nullable: true,
  })
  routePoints: RoutePoint[];
}
