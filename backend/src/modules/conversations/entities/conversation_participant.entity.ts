import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '@/modules/users/user.entity';
import { Message } from '@/modules/messages/entities/message.entity';

export enum ParticipantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum NotificationsOption {
  ALL = 'all',
  MENTIONS = 'mentions',
  NONE = 'none',
}

@Entity('conversation_participants')
@Index(['participantId', 'conversationId'], { unique: true })
export class ConversationParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ParticipantRole,
    default: ParticipantRole.MEMBER,
  })
  role: ParticipantRole;

  @Column({ type: 'timestamp', nullable: true })
  joinedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt?: Date;

  @Column({ type: 'int', nullable: true })
  unreadCount?: number;

  @Column({ type: 'bigint', nullable: true })
  lastReadSeq?: number; //last read message sequence number

  @Column({ type: 'timestamp', nullable: true })
  muteUntil?: Date;

  @Column({
    type: 'enum',
    enum: NotificationsOption,
    default: NotificationsOption.ALL,
  })
  notifications: NotificationsOption;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  //Relations
  //Ref: users.id < conversation_participants.user_id
  @Column({ type: 'uuid' })
  participantId: string;
  @ManyToOne(() => User, (user) => user.conversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  participant: User;

  //Ref: conversations.id < conversation_participants.conversation_id
  @Column({ type: 'uuid' })
  conversationId: string;
  @ManyToOne(() => Conversation, (conversation) => conversation.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  conversation: Conversation;

  //Ref: messages.id < conversation_participants.lastReadMessageId
  @Column({ type: 'uuid', nullable: true })
  lastReadMessageId?: string;
  @ManyToOne(() => Message, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  lastReadMessage?: Message;
}
