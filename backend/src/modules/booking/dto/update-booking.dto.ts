import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePassengerDto {
  @ApiPropertyOptional({
    description: 'Seat code used as identifier for the passenger row',
    example: 'A1',
  })
  @IsString()
  seatCode: string;

  @ApiPropertyOptional({
    description: 'Updated full name',
    example: 'Le Van B',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Updated document ID',
    example: '0123456789',
  })
  @IsOptional()
  @IsString()
  @MinLength(9)
  @MaxLength(12)
  @Matches(/^[0-9]+$/, { message: 'Document ID must contain only digits' })
  documentId?: string;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ description: 'Contact name', example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Contact email',
    example: 'new@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Contact phone', example: '0909123456' })
  @IsOptional()
  @IsString()
  @Matches(/^0[0-9]{9,10}$/, {
    message: 'Phone number must be valid Vietnamese format',
  })
  phone?: string;

  @ApiPropertyOptional({
    description:
      'Passenger updates keyed by seatCode; only personal info allowed',
    type: [UpdatePassengerDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePassengerDto)
  passengers?: UpdatePassengerDto[];
}
