import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Route } from './route.entity';

@Entity('route_points')
export class RoutePoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  routeId: string;

  @Column()
  type: string; // pickup | dropoff

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ default: 0 })
  orderIndex: number;

  @ManyToOne(() => Route, (route) => route.routePoints, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  route: Route;
}
