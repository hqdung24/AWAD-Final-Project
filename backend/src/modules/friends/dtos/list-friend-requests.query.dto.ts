import { IsIn, IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListFriendRequestsQueryDto {
  @ApiPropertyOptional({ enum: ['incoming', 'outgoing'], example: 'incoming' })
  @IsOptional()
  @IsIn(['incoming', 'outgoing'])
  direction?: 'incoming' | 'outgoing';

  @ApiPropertyOptional({ example: 'pending' })
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsPositive()
  limit?: number;
}
