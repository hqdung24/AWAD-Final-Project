import { ApiProperty } from '@nestjs/swagger';
import { ConversationType } from '../entities/conversation.entity';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class ConversationResponseDto {
  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'direct' })
  @Expose()
  type: ConversationType;

  @ApiProperty({ example: 'Project Team' })
  @Expose()
  title?: string;

  @ApiProperty({ example: '2024-04-27T12:34:56Z' })
  @Expose()
  lastMessageAt?: Date;

  @ApiProperty({ example: 'dm-key-string', required: false })
  @Expose()
  dm_key?: string;

  @ApiProperty({ example: '2024-04-27T12:34:56Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  lastMessageId?: string;

  @ApiProperty({ example: 'uuid-string' })
  @Expose()
  ownerId?: string;
}
