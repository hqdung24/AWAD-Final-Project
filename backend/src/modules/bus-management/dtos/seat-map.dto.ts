import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class SeatDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  seatCode!: string;

  @IsString()
  @IsNotEmpty()
  seatType!: string;

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}

export class SeatMapDto {
  @IsArray()
  seats!: SeatDto[];
}
