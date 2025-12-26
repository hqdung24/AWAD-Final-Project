import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SeatType } from '../enums/seat-type.enum';

export class GenerateSeatsDto {
  @ApiPropertyOptional({ description: 'Total seats to generate' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ description: 'Number of columns per row' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  columns?: number;

  @ApiPropertyOptional({ enum: SeatType, description: 'Seat type' })
  @IsOptional()
  @IsEnum(SeatType)
  seatType?: SeatType;

  @ApiPropertyOptional({ description: 'Replace existing seats' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  replaceExisting?: boolean;
}
