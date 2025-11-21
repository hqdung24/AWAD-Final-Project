import { CursorQueryDto } from '@/common/pagination/dtos/pagination-query.dto';
import { CursorPaginationProvider } from '@/common/pagination/providers/cursor-pagination.provider';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GetMessagesProvider {
  constructor(
    //Inject cursor pagination provider
    private readonly paginationProvider: CursorPaginationProvider,

    //Inject messages repo
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
  ) {}
  public async getMessages(convId: string, query: CursorQueryDto) {
    //build options for pagination
    const options = {
      where: { conversationId: convId },
      order: { createdAt: 'DESC' as const },
    };
    return this.paginationProvider.paginateMessages(
      query,
      this.messagesRepo,
      options,
    );
  }
}
