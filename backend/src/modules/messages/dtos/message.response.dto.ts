export class MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  type: string;
  message: string;
  content: string;
  seq: number;
  replyToId?: string;
  createdAt: Date;
  updatedAt: Date;
}
