import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../entities/conversation.entity';
import { ConversationParticipant } from '../entities/conversation_participant.entity';
import { ParticipantRole } from '../entities/conversation_participant.entity';
@Injectable()
export class ConversationParticipantsProvider {
  constructor(
    //Inject conversations repository
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,

    //Inject conversation participants repository
    @InjectRepository(ConversationParticipant)
    private conversationParticipantsRepository: Repository<ConversationParticipant>,
  ) {}

  //list participants of a conversation
  async listParticipants(convId: string): Promise<ConversationParticipant[]> {
    return this.conversationParticipantsRepository.find({
      where: { conversationId: convId },
      relations: ['participant'],
    });
  }

  //add participants to a conversation
  async addOneParticipants(
    convId: string,
    userId: string,
  ): Promise<ConversationParticipant[]> {
    // Create new participant
    const newParticipant = this.conversationParticipantsRepository.create({
      conversationId: convId,
      participantId: userId,
      role: ParticipantRole.MEMBER,
    });

    // Save participant
    await this.conversationParticipantsRepository.save(newParticipant);

    return this.listParticipants(convId);
  }

  async roleOfParticipant(
    convId: string,
    userId: string,
  ): Promise<ParticipantRole | null> {
    const participant = await this.conversationParticipantsRepository.findOne({
      where: { conversationId: convId, participantId: userId },
    });
    return participant ? participant.role : null;
  }
}
