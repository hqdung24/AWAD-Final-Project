import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FriendRequestResponseDto {
  @ApiProperty({ example: 'uuid-1' })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'uuid-from',
    description: 'user id who sent the request',
  })
  @Expose()
  fromUserId: string;

  @ApiProperty({
    example: 'uuid-to',
    description: 'user id who receives the request',
  })
  @Expose()
  toUserId: string;

  @ApiProperty({ example: 'pending' })
  @Expose()
  status: string;

  @ApiProperty({ required: false })
  @Expose()
  message?: string;

  @ApiProperty({ example: '2025-11-14T12:00:00Z' })
  @Expose()
  createdAt: string;
}
