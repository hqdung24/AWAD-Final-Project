import { IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CursorQueryDto } from '../../../common/pagination/dtos/pagination-query.dto';

export class OtherQueryDto {
  // for future query parameters beside pagination
  @IsOptional()
  @IsString()
  temp?: string;
}

export class ListMessagesQueryDto extends IntersectionType(
  CursorQueryDto,
  OtherQueryDto,
) {}
