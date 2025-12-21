import { IsNotEmpty, IsString } from 'class-validator';

export class SeatReleaseDto {
  @IsString()
  @IsNotEmpty()
  tripId!: string;

  @IsString()
  @IsNotEmpty()
  seatId!: string;
}
