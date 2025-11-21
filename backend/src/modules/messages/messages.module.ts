import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './providers/messages.service';
import { Message } from './entities/message.entity';
import { MessageRead } from './entities/message_read.entity';
import { CreateMessageProvider } from './providers/create-message.provider';
import { ReadMessageProvider } from './providers/read-message.provider';
import { GetMessagesProvider } from './providers/get-messages.provider';
import { PaginationModule } from '@/common/pagination/pagination.module';

@Module({
  controllers: [MessagesController],
  providers: [
    MessagesService,
    CreateMessageProvider,
    ReadMessageProvider,
    GetMessagesProvider,
  ],
  exports: [MessagesService],
  imports: [TypeOrmModule.forFeature([Message, MessageRead]), PaginationModule],
})
export class MessagesModule {}
