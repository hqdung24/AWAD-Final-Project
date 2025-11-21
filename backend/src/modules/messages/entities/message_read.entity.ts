import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from '@/modules/users/user.entity';

@Entity('message_reads')
@Index(['messageId', 'userId'], { unique: true })
export class MessageRead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  //Relations
  //Ref: messages.id < message_reads.message_id
  @Column({ type: 'uuid' })
  messageId: string;
  @ManyToOne(() => Message, (message) => message.messageReads, {
    onDelete: 'CASCADE',
  })
  message: Message;

  //Ref: users.id < message_reads.user_id
  @Column({ type: 'uuid' })
  userId: string;
  @ManyToOne(() => User, (user) => user.messageReads, {
    onDelete: 'CASCADE',
  })
  user: User;
}
