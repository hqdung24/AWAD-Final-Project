import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateSeatDto } from './create-seat.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSeatDto extends PartialType(CreateSeatDto) {
  @ApiPropertyOptional({
    description: 'Whether the seat is active/usable',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
