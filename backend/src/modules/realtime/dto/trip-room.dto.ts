import { IsNotEmpty, IsString } from 'class-validator';

export class TripRoomDto {
  @IsString()
  @IsNotEmpty()
  tripId!: string;
}
