import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'operator-uuid' })
  operatorId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ example: '51F-12345' })
  plateNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: 'Hyundai Universe' })
  model: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiPropertyOptional({ example: 'Sleeper' })
  busType?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({ example: 40 })
  seatCapacity: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '{"wifi":true,"water":true}' })
  amenitiesJson?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ example: 'VIP Sleeper 40' })
  name?: string;
}
