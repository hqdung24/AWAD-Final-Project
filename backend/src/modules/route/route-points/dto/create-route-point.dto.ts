import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

enum PointType {
  PICKUP = 'pickup',
  DROPOFF = 'dropoff',
}

export class CreateRoutePointDto {
  @ApiProperty({
    description: 'Type of route point',
    enum: PointType,
    example: PointType.PICKUP,
  })
  @IsNotEmpty()
  @IsEnum(PointType)
  type: PointType;

  @ApiProperty({
    description: 'Name of the route point',
    example: 'Bến xe Miền Đông',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Full address of the route point',
    example: '292 Đinh Bộ Lĩnh, Phường 26, Bình Thạnh, TP.HCM',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Latitude coordinate',
    example: 10.8142,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    example: 106.7053,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'Order index for sorting points',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderIndex?: number;
}
