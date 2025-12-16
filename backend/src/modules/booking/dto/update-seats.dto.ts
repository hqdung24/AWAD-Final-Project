import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SeatChangeDto {
  @ApiProperty({
    description: 'Current seat ID in this booking',
    example: 'current-seat-uuid',
  })
  @IsUUID()
  currentSeatId: string;

  @ApiProperty({
    description: 'Target seat ID to switch to (must be available in this trip)',
    example: 'new-seat-uuid',
  })
  @IsUUID()
  newSeatId: string;
}

export class UpdateSeatsDto {
  @ApiProperty({
    description: 'List of seat changes to apply in one operation',
    type: [SeatChangeDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatChangeDto)
  seatChanges: SeatChangeDto[];
}
