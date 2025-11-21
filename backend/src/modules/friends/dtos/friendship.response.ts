import { ApiProperty } from '@nestjs/swagger';

export class FriendshipResponseDto {
  @ApiProperty({ example: 'uuid-1' })
  id: string;

  @ApiProperty({ example: 'uuid-user' })
  user_id: string;

  @ApiProperty({ example: 'uuid-friend' })
  friend_id: string;

  @ApiProperty({ example: '2025-11-14T12:00:00Z' })
  created_at: string;
}
