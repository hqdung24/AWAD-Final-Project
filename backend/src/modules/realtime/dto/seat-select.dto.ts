import { IsNotEmpty, IsString } from 'class-validator';

export class SeatSelectDto {
  @IsString()
  @IsNotEmpty()
  tripId!: string;

  @IsString()
  @IsNotEmpty()
  seatId!: string;
}
