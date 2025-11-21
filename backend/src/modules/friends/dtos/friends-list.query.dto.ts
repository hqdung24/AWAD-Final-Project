import { IsOptional, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FriendsListQueryDto {
  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({ example: '2025-11-14T12:00:00Z' })
  @IsOptional()
  cursor?: string;
}
