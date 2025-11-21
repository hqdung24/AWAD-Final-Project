import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../posts/post.entity';
import { FriendRequest } from '../friends/entities/friend_request.entity';
import { Friendship } from '../friends/entities/friendship.entity';
import { Message } from '../messages/entities/message.entity';
import { ConversationParticipant } from '../conversations/entities/conversation_participant.entity';
import { Conversation } from '../conversations/entities/conversation.entity';
import { MessageRead } from '../messages/entities/message_read.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true, select: false })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  googleId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  username?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 20, default: 'USER' })
  role: string;

  @Column({ type: 'boolean', default: false })
  isVerified?: boolean;

  @Column({ type: 'boolean', default: true })
  isActive?: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Relations
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.fromUser)
  friendRequestsFrom: FriendRequest[];

  @OneToMany(() => FriendRequest, (friendRequest) => friendRequest.toUser)
  friendRequestsTo: FriendRequest[];

  @OneToMany(() => Friendship, (friendship) => friendship.userA)
  friendshipsA: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.userB)
  friendshipsB: Friendship[];

  //users.id < messages.senderId
  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  //Ref: users.id < conversation_participants.user_id
  @OneToMany(
    () => ConversationParticipant,
    // Using string to avoid circular dependency
    (participant) => participant.participant,
  )
  conversations: ConversationParticipant[];

  //Ref: users.id < conversations.owner_id
  @OneToMany(() => Conversation, (conversation) => conversation.owner)
  ownedConversations: Conversation[];

  //Ref: users.id < message_reads.user_id
  @OneToMany(() => MessageRead, (messageRead) => messageRead.user)
  messageReads: MessageRead[];
}
