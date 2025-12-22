import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @ApiPropertyOptional({ title: 'First Name', example: 'Admin' })
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @ApiPropertyOptional({ title: 'Last Name', example: 'User' })
  lastName?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  @ApiPropertyOptional({ title: 'Email', example: 'admin@example.com' })
  email?: string;
}
