import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ title: 'First Name', example: 'Admin' })
  firstName: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @ApiPropertyOptional({ title: 'Last Name', example: 'User' })
  lastName?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ title: 'Email', example: 'admin@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @ApiProperty({ title: 'Password', example: 'strongPassword123' })
  password: string;

  @IsEnum(RoleType)
  @IsOptional()
  @ApiPropertyOptional({
    title: 'Role',
    example: RoleType.ADMIN,
    enum: RoleType,
  })
  role?: RoleType;

  @IsOptional()
  @ApiPropertyOptional({ title: 'Active', example: true })
  isActive?: boolean;
}
