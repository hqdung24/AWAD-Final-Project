import { PaginationModule } from '@/common/pagination/pagination.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { ConversationsController } from './conversations.controller';
import { Conversation } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation_participant.entity';
import { ConversationParticipantsProvider } from './providers/conversation-participants.provider';
import { ConversationsProvider } from './providers/conversations.provider';
import { ConversationsService } from './providers/conversations.service';

@Module({
  controllers: [ConversationsController],
  providers: [
    ConversationsService,
    ConversationParticipantsProvider,
    ConversationsProvider,
  ],
  exports: [ConversationsService],
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationParticipant]),
    forwardRef(() => UsersModule),
    PaginationModule,
  ],
})
export class ConversationsModule {}
