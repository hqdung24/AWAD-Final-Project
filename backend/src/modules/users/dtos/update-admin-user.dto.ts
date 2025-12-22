import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

export class UpdateAdminUserDto {
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

  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(100)
  @ApiPropertyOptional({ title: 'Password', example: 'newPassword123' })
  password?: string;

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
