/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { ListMessagesQueryDto } from '../dtos/list-messages.query.dto';
import { CreateMessageProvider } from './create-message.provider';
import { GetMessagesProvider } from './get-messages.provider';

@Injectable()
export class MessagesService {
  constructor(
    //Inject create message provider
    private readonly createMessageProvider: CreateMessageProvider,

    //Inject get message provider
    private readonly getMessagesProvider: GetMessagesProvider,
  ) {}
  // Return a simple mock list — replace with DB logic later
  async listMessages(conversationId: string, query: ListMessagesQueryDto) {
    query.limit ||= 20; // default limit 20 for messages
    const paginatedResult = this.getMessagesProvider.getMessages(
      conversationId,
      query,
    );
    return paginatedResult;
  }

  async createMessage(
    conversationId: string,
    userId: string,
    dto: CreateMessageDto,
  ) {
    //Create message in db
    const msg = await this.createMessageProvider.createMessage(
      conversationId,
      userId,
      dto,
    );

    //Socket emit logic can be added here later

    //Return created message
    return msg;
  }

  async markRead(conversationId: string, userId: string, seq: string) {
    // TODO: persist read receipt; return stub
    return { conversationId, userId, readUpToSeq: seq };
  }

  async getUnreadCount(conversationId: string, userId: string) {
    // TODO: calculate unread count
    return { conversationId, userId, unreadCount: 0 };
  }

  // legacy methods kept for compatibility
  findAll() {
    return [] as unknown[];
  }

  findOne(id: string) {
    return { id };
  }
}
