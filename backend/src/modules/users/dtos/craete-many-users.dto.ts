import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class CreateManyUsersDto {
  @ApiProperty({
    description: 'Array of users to be created',
    type: 'array',
    items: {
      type: 'User',
    },
  })
  @IsNotEmpty({ each: true })
  @IsArray({ message: 'users must be an array of CreateUserDto' })
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users: CreateUserDto[];
}
