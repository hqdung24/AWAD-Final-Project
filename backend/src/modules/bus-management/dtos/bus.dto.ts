import { IsNotEmpty, IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';

export class BusDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsNotEmpty()
  operatorId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  plateNumber!: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @Min(1)
  seatCapacity!: number;

  @IsString()
  @IsOptional()
  seatMetaJson?: string;
}

export class CreateBusDto extends BusDto {}

export class UpdateBusDto {
  @IsOptional()
  @IsUUID()
  operatorId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seatCapacity?: number;

  @IsOptional()
  @IsString()
  seatMetaJson?: string;
}

export class BusAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  routeId!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string; // ISO

  @IsString()
  @IsNotEmpty()
  endTime!: string; // ISO
}
