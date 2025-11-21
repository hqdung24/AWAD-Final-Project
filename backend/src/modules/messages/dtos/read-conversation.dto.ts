import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadConversationDto {
  @ApiProperty({
    description: 'Sequence up to which messages are read (inclusive)',
    example: '150',
  })
  @IsString()
  seq: string;
}
