import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationsOption,
  ParticipantRole,
} from '../entities/conversation_participant.entity';

export class ParticipantResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  id: string;

  @ApiProperty({ example: 'member' })
  role: ParticipantRole;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', required: false })
  joinedAt?: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', required: false })
  lastReadAt?: Date;

  @ApiProperty({ example: 5, required: false })
  unreadCount?: number;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', required: false })
  muteUntil?: Date;

  @ApiProperty({ example: 'all' })
  notifications: NotificationsOption;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt: Date;

  //Relations
  //Ref: users.id < conversation_participants.user_id
  @ApiProperty({
    example: 'uuid-string',
    description: 'ID of the participant user',
  })
  participantId: string;

  //Ref: conversations.id < conversation_participants.conversation_id
  @ApiProperty({
    example: 'uuid-string',
    description: 'ID of the conversation',
  })
  conversationId: string;

  //Ref: messages.id < conversation_participants.lastReadMessageId
  @ApiProperty({
    example: 'uuid-string',
    description: 'ID of the last read message',
    required: false,
  })
  lastReadMessageId?: string;

  constructor(partial: Partial<ParticipantResponseDto>) {
    Object.assign(this, partial);
  }
}
