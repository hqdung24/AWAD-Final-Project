import { IsOptional, IsPositive, IsString } from 'class-validator';

export class BaseCursorQueryDto {
  @IsOptional()
  @IsPositive()
  limit?: number;
}

export class OffsetQueryDto extends BaseCursorQueryDto {
  @IsOptional()
  @IsPositive()
  page?: number;

  @IsOptional()
  @IsPositive()
  offset?: number;
}
export class CursorQueryDto extends BaseCursorQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}
