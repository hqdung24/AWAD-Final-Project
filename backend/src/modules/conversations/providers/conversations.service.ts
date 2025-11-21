import { UsersService } from '@/modules/users/providers/users.service';
import {
  BadGatewayException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConversationParticipantsProvider } from './conversation-participants.provider';
import { ConversationsProvider } from './conversations.provider';
import { ListConversationsQueryDto } from '../dtos/list-conversations.query.dto';

@Injectable()
export class ConversationsService {
  constructor(
    //Inject conversation provider
    private readonly conversationsProvider: ConversationsProvider,

    //Inject conversation participants provider
    private readonly conversationParticipantsProvider: ConversationParticipantsProvider,

    //@Inject user service
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
  ) {}
  // list conversations
  listConversations(userId: string, query: ListConversationsQueryDto) {
    query.limit ||= 10;
    //call provider to get paginated conversations
    const paginatedResult = this.conversationsProvider.listConversations(
      userId,
      query,
    );
    return paginatedResult;
  }

  // new stubs for API
  createGroupConversation(userId: string, memberIds: string[], title: string) {
    const result = this.conversationsProvider.createGroupConversation(
      userId,
      memberIds,
      title,
    );
    return result;
  }

  async createDirectConversation(userId: string, otherUserId: string) {
    // check if direct conversation already exists
    const existingConv =
      await this.conversationsProvider.findDirectConversation(
        userId,
        otherUserId,
      );
    console.log('create direct conversation', existingConv);
    if (existingConv != null) {
      return existingConv;
    }
    //Create new direct conversation
    const result = this.conversationsProvider.createDirectConversation(
      userId,
      otherUserId,
    );
    return result;
  }

  //Participants services
  async addOneParticipant(userId: string, convId: string, userIdToAdd: string) {
    //check if current user has permission to add participant
    const isAdmin =
      await this.conversationParticipantsProvider.roleOfParticipant(
        convId,
        userId,
      );
    // TODO: implement actual permission check

    if (!isAdmin) {
      throw new Error('Permission denied');
    }
    const result =
      await this.conversationParticipantsProvider.addOneParticipants(
        convId,
        userIdToAdd,
      );
    return result;
  }

  async listParticipants(userId: string, convId: string) {
    const result =
      await this.conversationParticipantsProvider.listParticipants(convId);
    return result;
  }

  async getConversationDetails(userId: string, convId: string) {
    const conversation =
      await this.conversationsProvider.getConversationDetails(userId, convId);
    if (!conversation) {
      throw new BadGatewayException('Conversation not found or access denied');
    }
    return conversation;
  }
}
