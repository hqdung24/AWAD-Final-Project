import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MessagesService } from './providers/messages.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { ListMessagesQueryDto } from './dtos/list-messages.query.dto';
import { ReadConversationDto } from './dtos/read-conversation.dto';
import { ActiveUser } from '@/modules/auth/decorator/active-user.decorator';

@ApiBearerAuth('accessToken')
@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Create message in a conversation
  @Post('conversations/:convId/messages')
  @ApiOperation({ summary: 'Create message in a conversation' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, description: 'Message created successfully' })
  async createMessage(
    @ActiveUser('sub') userId: string,
    @Param('convId') convId: string,
    @Body() body: CreateMessageDto,
  ) {
    return this.messagesService.createMessage(convId, userId, body);
  }

  // List messages in a conversation
  @Get('conversations/:convId/messages')
  @ApiOperation({ summary: 'List messages in a conversation' })
  async listMessages(
    @Param('convId') convId: string,
    @Query() query: ListMessagesQueryDto,
  ) {
    return this.messagesService.listMessages(convId, query);
  }

  // Mark conversation as read up to a seq
  @Post('conversations/:convId/read')
  @ApiOperation({ summary: 'Mark conversation as read up to a seq' })
  async markRead(
    @ActiveUser('sub') userId: string,
    @Param('convId') convId: string,
    @Body() body: ReadConversationDto,
  ) {
    return this.messagesService.markRead(convId, userId, body.seq);
  }

  // Get unread message count for conversation
  @Get('conversations/:convId/unread-count')
  @ApiOperation({ summary: 'Get unread message count for conversation' })
  async getUnreadCount(
    @ActiveUser('sub') userId: string,
    @Param('convId') convId: string,
  ) {
    return this.messagesService.getUnreadCount(convId, userId);
  }
}
