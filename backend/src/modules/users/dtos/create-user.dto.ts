import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({ title: 'First Name', example: 'John' })
  firstName: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty({ title: 'Last Name', example: 'Doe' })
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiProperty({ title: 'Username', example: 'johndoe' })
  username?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ title: 'Email', example: 'johndoe@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @ApiProperty({ title: 'Password', example: 'strongPassword123' })
  password: string;
}
