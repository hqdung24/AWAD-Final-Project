import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Message } from '@/modules/messages/entities/message.entity';
import { ConversationParticipant } from './conversation_participant.entity';
import { User } from '@/modules/users/user.entity';
export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
}

@Index('idx_dm_key_unique', ['dm_key'], { unique: true })
@Index('idx_conversation_last_message_at', ['lastMessageAt', 'id']) // added index for lastMessageAt and id for efficient querying of recent conversations
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  @Column({ type: 'text', name: 'dm_key', nullable: true, unique: true }) // for direct message unique key
  dm_key?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  //Relations
  //Ref: conversations.id < messages.conversationId
  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
    nullable: true,
  })
  messages: Message[];

  //Ref: messages.id < conversations.lastMessage
  @Column({ type: 'uuid', nullable: true })
  lastMessageId?: string;
  @OneToOne(() => Message, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'lastMessageId' })
  lastMessage?: Message;

  //Ref: conversations.id < conversation_participants.conversation_id
  @OneToMany(
    () => ConversationParticipant,
    (participant) => participant.conversation,
    {
      cascade: true,
    },
  )
  participants: ConversationParticipant[];

  //Ref: users.id < conversations.owner_id
  @Column({ type: 'uuid', nullable: true })
  ownerId?: string;
  @ManyToOne(() => User, (user) => user.conversations, { nullable: true })
  @JoinColumn()
  owner?: User;
}
