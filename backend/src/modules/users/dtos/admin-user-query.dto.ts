import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

export class AdminUserQueryDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search by name or email' })
  search?: string;

  @IsOptional()
  @IsEnum(RoleType)
  @ApiPropertyOptional({ enum: RoleType })
  role?: RoleType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Filter by active status' })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @ApiPropertyOptional({ default: 10 })
  limit?: number;
}
