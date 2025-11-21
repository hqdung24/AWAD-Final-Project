import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
  Check,
} from 'typeorm';
import { User } from '../../users/user.entity';

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

@Entity('friend_requests')
@Index(['fromUserId', 'toUserId'], { unique: true }) // tránh duplicate request
@Index(['toUserId', 'status'])
@Check('from_to_different', '"fromUserId" <> "toUserId"') // tránh self-request
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FriendRequestStatus,
    default: FriendRequestStatus.PENDING,
  })
  status: FriendRequestStatus;

  @Column({ type: 'varchar', nullable: true })
  message?: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  // FK columns (explicit) — giúp query nhanh + enforce unique

  // Relations
  @Column('uuid')
  fromUserId: string;
  @ManyToOne(() => User, (user) => user.friendRequestsFrom, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  fromUser: User;

  @Column('uuid')
  toUserId: string;
  @ManyToOne(() => User, (user) => user.friendRequestsTo, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  toUser: User;
}
