import { ActiveUser } from '@/modules/auth/decorator/active-user.decorator';
import type { ActiveUserData } from '@/modules/auth/interfaces/active-user-data.interface';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddOneParticipantDto } from './dtos/add-participants.dto';
import { ConversationResponseDto } from './dtos/conversation.response.dto';
import { CreateGroupConversationDto } from './dtos/create-conversation.dto';
import { ListConversationsQueryDto } from './dtos/list-conversations.query.dto';
import { ListParticipantsResponseDto } from './dtos/list-participants.response.dto';
import { ConversationsService } from './providers/conversations.service';
import { plainToInstance } from 'class-transformer';

@ApiTags('Conversations')
@ApiBearerAuth('accessToken')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  // Create group conversation
  @Post()
  @ApiOperation({ summary: 'Create a group conversation' })
  @ApiResponse({ status: 201, type: ConversationResponseDto })
  async create(
    @ActiveUser() user: ActiveUserData,
    @Body() body: CreateGroupConversationDto,
  ) {
    const result = await this.conversationsService.createGroupConversation(
      String(user.sub),
      body.participantIds,
      body.title,
    );
    return plainToInstance(ConversationResponseDto, result);
  }

  // List conversations for current user
  @Get()
  @ApiOperation({ summary: 'List conversations for current user' })
  @ApiResponse({ status: 200, type: [ConversationResponseDto] })
  async list(
    @ActiveUser() user: ActiveUserData,
    @Query() query: ListConversationsQueryDto,
  ) {
    const result = await this.conversationsService.listConversations(
      String(user.sub),
      query,
    );
    return result;
  }

  // Get conversation details
  @Get(':convId')
  @ApiOperation({ summary: 'Get conversation details' })
  @ApiResponse({ status: 200, type: ConversationResponseDto })
  async get(
    @ActiveUser() user: ActiveUserData,
    @Param('convId') convId: string,
  ) {
    const result = await this.conversationsService.getConversationDetails(
      String(user.sub),
      convId,
    );
    return plainToInstance(ConversationResponseDto, result);
  }

  // Participants endpoints
  @Post(':convId/participants')
  @ApiOperation({ summary: 'Add participants to a conversation' })
  @ApiResponse({ status: 200 })
  async addParticipants(
    @ActiveUser() user: ActiveUserData,
    @Param('convId') convId: string,
    @Body() body: AddOneParticipantDto,
  ) {
    const result = await this.conversationsService.addOneParticipant(
      String(user.sub),
      convId,
      body.userId,
    );
    return plainToInstance(ListParticipantsResponseDto, {
      participants: result,
    });
  }

  @Get(':convId/participants')
  @ApiOperation({ summary: 'List participants of a conversation' })
  @ApiResponse({ status: 200, type: ListParticipantsResponseDto })
  async listParticipants(
    @ActiveUser() user: ActiveUserData,
    @Param('convId') convId: string,
  ) {
    const result = await this.conversationsService.listParticipants(
      String(user.sub),
      convId,
    );
    return plainToInstance(ListParticipantsResponseDto, {
      participants: result,
    });
  }
}
