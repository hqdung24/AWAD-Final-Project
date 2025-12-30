import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PassengerDto } from './passenger.dto';
import { ContactInfoDto } from './contact-info.dto';

export class CreateBookingDto {
  @ApiProperty({
    description:
      'JWT lock token obtained from the seat lock endpoint, contains tripId and seatIds',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty()
  @IsString()
  lockToken: string;

  @ApiProperty({
    description:
      'Array of passenger information. Must match the number of locked seats.',
    type: [PassengerDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one passenger is required' })
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers: PassengerDto[];

  @ApiProperty({
    description: 'Contact information for booking confirmation',
    type: ContactInfoDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @ApiProperty({
    description:
      'UUID of the payment method to use for this booking (optional for now)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  paymentMethodId?: string;

  @IsUUID()
  @ApiProperty({
    description: 'Optional user ID for authenticated users',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  userId?: string; // Optional user ID for authenticated users

  @ApiProperty({
    description: 'Pickup route point ID selected by the passenger',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  pickupPointId?: string;

  @ApiProperty({
    description: 'Dropoff route point ID selected by the passenger',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  dropoffPointId?: string;
}
