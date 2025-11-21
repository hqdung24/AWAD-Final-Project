import { IsArray, ArrayMinSize, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDirectConversationDto {
  @ApiProperty({ description: 'User 1 id (uuid string)' })
  @IsString()
  user1Id: string;

  @ApiProperty({ description: 'User 2 id (uuid string)' })
  @IsString()
  user2Id: string;
}

export class CreateGroupConversationDto {
  @ApiProperty({
    type: [String],
    description: 'Participant ids (uuid strings)',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  @IsArray()
  @ArrayMinSize(2)
  participantIds: string[];

  @ApiPropertyOptional({
    description: 'Optional conversation title',
    example: 'Project Team',
  })
  @IsOptional()
  @IsString()
  title: string;
}
