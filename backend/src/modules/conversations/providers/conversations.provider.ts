import { CursorPaginationProvider } from '@/common/pagination/providers/cursor-pagination.provider';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListConversationsQueryDto } from '../dtos/list-conversations.query.dto';
import {
  Conversation,
  ConversationType,
} from '../entities/conversation.entity';
import {
  ConversationParticipant,
  ParticipantRole,
} from '../entities/conversation_participant.entity';
@Injectable()
export class ConversationsProvider {
  constructor(
    //Inject conversations repository
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,

    //Inject conversation participants repository
    @InjectRepository(ConversationParticipant)
    private conversationParticipantsRepository: Repository<ConversationParticipant>,

    //Inject pagination provider
    private cursorPaginationProvider: CursorPaginationProvider,
  ) {}

  // Find conversation by ID
  async findById(convId: string): Promise<Conversation | null> {
    return this.conversationsRepository.findOne({
      where: { id: convId },
    });
  }

  // Create a new direct conversation
  // Create a direct conversation (1:1)
  async createDirectConversation(
    fromUserId: string,
    toUserId: string,
    title?: string,
  ): Promise<Conversation> {
    // Create dm_key to prevent duplicates
    const participants = [fromUserId, toUserId].sort();
    const dmKey = participants.join(':');

    // Check if a direct conversation already exists
    const existing = await this.conversationsRepository.findOne({
      where: { dm_key: dmKey },
      relations: ['participants'],
    });

    if (existing) return existing;

    // Create conversation
    const conversation = this.conversationsRepository.create({
      type: ConversationType.DIRECT,
      title,
      dm_key: dmKey,
      lastMessageAt: new Date(),
    });

    const savedConv = await this.conversationsRepository.save(conversation);

    // Create participants
    const convParticipants = participants.map((participantId) =>
      this.conversationParticipantsRepository.create({
        participantId,
        conversationId: savedConv.id,
        role: ParticipantRole.MEMBER,
        joinedAt: new Date(),
      }),
    );

    await this.conversationParticipantsRepository.save(convParticipants);

    return {
      ...savedConv,
      participants: convParticipants,
    };
  }

  async createGroupConversation(
    ownerId: string,
    memberIds: string[],
    title: string,
  ): Promise<Conversation> {
    if (!title) {
      throw new Error('Group title is required');
    }

    // Normalize member list (remove duplicates, remove owner)
    const uniqueMemberIds = Array.from(
      new Set(memberIds.filter((id) => id !== ownerId)),
    );

    if (uniqueMemberIds.length === 0) {
      throw new Error('Group must have at least 2 members');
    }
    // Create participants: owner = admin/owner, members = member
    const participantsToCreate = [
      this.conversationParticipantsRepository.create({
        participantId: ownerId,
        role: ParticipantRole.OWNER,
        joinedAt: new Date(),
      }),
      ...uniqueMemberIds.map((id) =>
        this.conversationParticipantsRepository.create({
          participantId: id,
          role: ParticipantRole.MEMBER,
          joinedAt: new Date(),
        }),
      ),
    ];
    // Create conversation first
    const conversation = this.conversationsRepository.create({
      type: ConversationType.GROUP,
      title,
      ownerId,
      participants: participantsToCreate, //cascade insert
      lastMessageAt: new Date(), //initialize lastMessageAt for sorting
    });

    const savedConv = await this.conversationsRepository.save(conversation);

    return savedConv;
  }

  async listConversations(userId: string, query: ListConversationsQueryDto) {
    //other query parameters can be extracted from query object if needed and use them here
    const { temp, ...paginationQuery } = query;
    void temp; //avoid unused variable warning

    //create query options
    const findOptions = {
      where: {
        participants: {
          participantId: userId,
        },
      },
    } as const;

    const paginatedResult =
      await this.cursorPaginationProvider.paginateConversations(
        paginationQuery,
        this.conversationsRepository,
        findOptions,
      );

    return paginatedResult;
  }

  async findDirectConversation(
    userId1: string,
    userId2: string,
  ): Promise<Conversation | null> {
    // Create dm_key
    const participants = [userId1, userId2].sort();
    const dmKey = participants.join(':');

    // Find conversation by dm_key
    const conversation = await this.conversationsRepository.findOne({
      where: { dm_key: dmKey },
      relations: ['participants'],
    });

    return conversation;
  }

  async getConversationDetails(
    userId: string,
    convId: string,
  ): Promise<Conversation | null> {
    const conversation = await this.conversationsRepository
      .createQueryBuilder('conversation')
      .innerJoinAndSelect(
        'conversation.participants',
        'participant',
        'participant.participantId = :userId',
        { userId },
      )
      .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
      .where('conversation.id = :convId', { convId })
      .getOne();

    return conversation;
  }
}
