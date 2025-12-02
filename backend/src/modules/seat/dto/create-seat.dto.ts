import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SeatType } from '../enums/seat-type.enum';

export class CreateSeatDto {
  @ApiProperty({
    description: 'Seat code (e.g., A1, A2, B1, B2)',
    example: 'A1',
  })
  @IsNotEmpty()
  @IsString()
  seatCode: string;

  @ApiProperty({
    description: 'Seat type',
    enum: SeatType,
    example: SeatType.STANDARD,
  })
  @IsNotEmpty()
  @IsEnum(SeatType)
  seatType: SeatType;
}
