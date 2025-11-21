import { IsArray, ArrayMinSize, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddParticipantsDto {
  @ApiProperty({ type: [String], description: 'Array of user ids to add' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds: string[];
}

export class AddOneParticipantDto {
  @ApiProperty({ type: String, description: 'User id to add' })
  @IsString()
  userId: string;
}
