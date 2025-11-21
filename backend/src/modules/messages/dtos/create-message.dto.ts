import { IsOptional, IsString, IsArray } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiPropertyOptional({
    description: 'Client generated id for idempotency',
    example: 'cmsg_123',
  })
  @IsOptional()
  @IsString()
  clientMsgId?: string;

  @ApiProperty({ description: 'Message content', example: 'Hello world' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Attachment urls or ids' })
  @IsOptional()
  @IsArray()
  attachments?: any[];

  @ApiPropertyOptional({ description: 'Reply to message seq' })
  @IsOptional()
  @IsString()
  replyToSeq?: string;

  @ApiPropertyOptional({ description: 'Reply to message id' })
  @IsOptional()
  @IsString()
  replyToMessageId?: string;
}
