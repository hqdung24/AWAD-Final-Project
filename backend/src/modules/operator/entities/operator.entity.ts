import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Route } from '@/modules/route/entities/route.entity';
import { Bus } from '@/modules/bus/entities/bus.entity';

@Entity('operators')
export class Operator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  contactEmail: string;

  @Column()
  contactPhone: string;

  @Column()
  status: string; // pending / active / suspended

  @Column({ type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @OneToMany(() => Route, (route) => route.operator)
  routes: Route[];

  @OneToMany(() => Bus, (bus) => bus.operator)
  buses: Bus[];
}
