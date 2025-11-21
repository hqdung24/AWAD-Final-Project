import { IsDate, IsOptional } from 'class-validator';
import { IntersectionType } from '@nestjs/swagger';
import { OffsetQueryDto } from '@/common/pagination/dtos/pagination-query.dto';

export class GetPostsBaseDto {
  @IsDate()
  @IsOptional()
  startDate?: Date;
  @IsDate()
  @IsOptional()
  endDate?: Date;
}

export class GetPostsDto extends IntersectionType(
  GetPostsBaseDto,
  OffsetQueryDto,
) {}
