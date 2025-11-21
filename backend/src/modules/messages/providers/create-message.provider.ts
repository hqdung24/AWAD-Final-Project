import { Conversation } from '@/modules/conversations/entities/conversation.entity';
import { ConversationParticipant } from '@/modules/conversations/entities/conversation_participant.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateMessageDto } from '../dtos/create-message.dto';
import { Message, MessageType } from '../entities/message.entity';

@Injectable()
export class CreateMessageProvider {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  //method to create a message
  async createMessage(
    conversationId: string,
    senderId: string,
    dto: CreateMessageDto,
  ): Promise<Message> {
    return this.dataSource.transaction(async (manager) => {
      const convRepo = manager.getRepository(Conversation);
      const msgRepo = manager.getRepository(Message);
      const participantRepo = manager.getRepository(ConversationParticipant);

      // 1. Check conversation tồn tại
      const conversation = await convRepo.findOne({
        where: { id: conversationId },
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // 2. Check user có là participant của conversation không
      const participant = await participantRepo.findOne({
        where: {
          conversationId,
          participantId: senderId,
        },
      });

      if (!participant) {
        throw new ForbiddenException('You are not in this conversation');
      }

      // 3. Generate seq an toàn cho conversation (pessimistic lock)
      //    Lấy message có seq lớn nhất trong conv rồi +1
      const lastMessage = await msgRepo
        .createQueryBuilder('m')
        .where('m.conversationId = :conversationId', { conversationId })
        .orderBy('m.seq', 'DESC')
        .setLock('pessimistic_write') // lock rows để tránh race condition
        .getOne();

      const nextSeq: number = Number(lastMessage?.seq ?? 0) + 1;

      // 4. Xử lý replyTo (nếu có)
      let replyToId: string | undefined;

      if (dto.replyToMessageId) {
        const replyMsg = await msgRepo.findOne({
          where: {
            id: dto.replyToMessageId,
            conversationId,
          },
        });

        if (!replyMsg) {
          throw new NotFoundException(
            'Reply message not found in conversation',
          );
        }

        replyToId = replyMsg.id;
      }

      // 5. Tạo entity message
      const message = msgRepo.create({
        seq: nextSeq,
        senderId,
        conversationId,
        type: MessageType.TEXT,
        message: dto.content,
        content: dto.content,
        replyToId,
      });

      // 6. Lưu message
      const saved = await msgRepo.save(message);

      // 7. Update conversation lastMessageId + lastMessageAt
      await convRepo.update(
        { id: conversationId },
        {
          lastMessageId: saved.id,
          lastMessageAt: saved.createdAt,
        },
      );

      // 8. TODO: update unreadCount cho các participant khác (sau này)
      // 9. TODO: emit websocket event ở chỗ khác (gateway / events service)

      return saved;
    });
  }
}
