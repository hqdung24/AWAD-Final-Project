import { ApiProperty } from '@nestjs/swagger';
import { ParticipantResponseDto } from './participant.response.dto';
export class ListParticipantsResponseDto {
  @ApiProperty({
    description: 'List of participants in the conversation',
  })
  participants: ParticipantResponseDto[];
}
