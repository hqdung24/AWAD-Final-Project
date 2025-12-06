import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class PassengerDto {
  @ApiProperty({
    description: 'Full name of the passenger',
    example: 'Nguyen Van A',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @ApiProperty({
    description: 'Government-issued document ID (CMND/CCCD)',
    example: '0123456789',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(9)
  @MaxLength(12)
  @Matches(/^[0-9]+$/, { message: 'Document ID must contain only digits' })
  documentId: string;

  @ApiProperty({
    description: 'Phone number of the passenger (optional)',
    example: '0909123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^0[0-9]{9,10}$/, {
    message: 'Phone number must be valid Vietnamese format',
  })
  phone?: string;

  @ApiProperty({
    description: 'Seat code assigned to this passenger',
    example: 'A1',
  })
  @IsNotEmpty()
  @IsString()
  seatCode: string;
}
