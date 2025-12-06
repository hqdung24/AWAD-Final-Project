import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';

export class LockSeatsDto {
  @ApiProperty({
    description: 'Trip ID to lock seats for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  tripId: string;

  @ApiProperty({
    description: 'Array of seat IDs to lock',
    type: [String],
    example: ['seat-id-1', 'seat-id-2', 'seat-id-3'],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  seatIds: string[];
}
