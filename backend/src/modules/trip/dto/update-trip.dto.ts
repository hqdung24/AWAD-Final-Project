import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTripDto } from './create-trip.dto';
import { IsEnum, IsOptional } from 'class-validator';

enum TripStatus {
  SCHEDULED = 'scheduled',
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
