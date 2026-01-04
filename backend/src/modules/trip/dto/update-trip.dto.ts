import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTripDto } from './create-trip.dto';
import { IsEnum, IsOptional } from 'class-validator';

export enum TripStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export class UpdateTripDto extends PartialType(CreateTripDto) {
  @ApiPropertyOptional({
    description: 'Trip status',
    enum: TripStatus,
    example: TripStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;
}
