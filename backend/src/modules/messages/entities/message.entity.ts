import { Conversation } from '@/modules/conversations/entities/conversation.entity';
import { User } from '@/modules/users/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MessageRead } from './message_read.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  REPLY = 'reply',
}

@Index('idx_conversation_message_seq', ['conversationId', 'seq'], {
  unique: true,
}) // added index for conversationId and seq, cannot add order option, define when querying
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'varchar', name: 'media_url', nullable: true })
  mediaUrl?: string;

  @Column({ type: 'timestamp', name: 'edited_at', nullable: true })
  editedAt?: Date;

  @Column({ type: 'bigint' }) // sequential number within the conversation, unique per conversation, count from 1
  seq: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
  //Relations
  //users.id < messages.senderId
  @Column({ type: 'uuid' })
  senderId: string;
  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn()
  sender: User;

  //Ref: conversations.id < messages.conversationId
  @Column({ type: 'uuid' })
  conversationId: string;
  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    nullable: true,
  })
  @JoinColumn()
  conversation: Conversation;

  //Ref: messages.id < messages.replyToId, self-referencing
  @Column({ type: 'uuid', nullable: true })
  replyToId?: string;
  @ManyToOne(() => Message, { nullable: true })
  @JoinColumn()
  replyTo: Message;

  //Ref: messages.id < message_reads.message_id
  @OneToMany(() => MessageRead, (messageRead) => messageRead.message)
  messageReads: MessageRead[];
}
