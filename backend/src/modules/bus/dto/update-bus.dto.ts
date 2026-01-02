import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBusDto } from './create-bus.dto';

export class UpdateBusDto extends PartialType(CreateBusDto) {
  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
