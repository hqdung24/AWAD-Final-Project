import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'Booking ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    description: 'Rating for the trip (1-5)',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Recommendation score (1-10)',
    minimum: 1,
    maximum: 10,
    example: 9,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  recommendation: number;

  @ApiProperty({
    description: 'Feedback comment',
    minLength: 10,
    maxLength: 1000,
    example: 'Great trip! The bus was clean and comfortable.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  comment: string;

  @ApiPropertyOptional({
    description: 'Array of photo URLs',
    type: [String],
    maxItems: 5,
  })
  @IsOptional()
  @IsString({ each: true })
  photos?: string[];
}
