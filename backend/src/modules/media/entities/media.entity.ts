import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MediaDomain } from '../enums/media-domain.enum';
import { MediaType } from '../enums/media-type.enum';
import { User } from '@/modules/users/entities/user.entity';

@Index(['domain', 'domainId'])
@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MediaDomain })
  domain: MediaDomain;

  @Column({ type: 'uuid', name: 'domain_id' })
  domainId: string;

  @Column({ type: 'enum', enum: MediaType })
  type: MediaType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  key?: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  mime?: string | null;

  @Column({ type: 'bigint', nullable: true, default: 0 })
  size?: number | null;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt?: Date;

  @OneToOne(() => User, (user) => user.avatarMedia, { nullable: true })
  user?: User | null;
}
