import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFriendRequestDto {
  @ApiProperty({
    description: 'User id to send request to',
    example: 'uuid-1234',
  })
  @IsString()
  toUserId: string;

  @ApiProperty({
    description: 'Optional message',
    required: false,
    example: "Hi, let's connect",
  })
  @IsOptional()
  @IsString()
  message?: string;
}
