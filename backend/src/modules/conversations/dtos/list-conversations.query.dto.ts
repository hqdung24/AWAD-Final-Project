import { IsOptional, IsString } from 'class-validator';
import { IntersectionType } from '@nestjs/swagger';
import { CursorQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';
export class OtherQueryDto {
  @IsOptional()
  @IsString()
  temp?: string; // for future query parameters beside pagination
}

export class ListConversationsQueryDto extends IntersectionType(
  CursorQueryDto,
  OtherQueryDto,
) {}
