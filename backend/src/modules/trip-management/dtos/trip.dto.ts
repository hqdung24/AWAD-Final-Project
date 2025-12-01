import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StopDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(['pickup', 'dropoff'])
  type!: 'pickup' | 'dropoff';

  @IsNumber()
  @Min(0)
  order!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class TripDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsNotEmpty()
  routeId!: string;

  @IsUUID()
  @IsNotEmpty()
  busId!: string;

  @IsDateString()
  departureTime!: string;

  @IsDateString()
  arrivalTime!: string;

  @IsOptional()
  @IsString()
  seatLayout?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StopDto)
  stops?: StopDto[];
}

export class CreateTripDto extends TripDto {}

export class UpdateTripDto {
  @IsOptional()
  @IsUUID()
  routeId?: string;

  @IsOptional()
  @IsUUID()
  busId?: string;

  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @IsOptional()
  @IsDateString()
  arrivalTime?: string;

  @IsOptional()
  @IsString()
  seatLayout?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopDto)
  stops?: StopDto[];
}
