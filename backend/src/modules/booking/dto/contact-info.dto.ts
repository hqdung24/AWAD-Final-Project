import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ContactInfoDto {
  @ApiProperty({
    description: 'Contact person name',
    example: 'Nguyen Van A',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Contact email address',
    example: 'nguyenvana@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '0909123456',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^0[0-9]{9,10}$/, {
    message: 'Phone number must be valid Vietnamese format',
  })
  phone: string;
}
