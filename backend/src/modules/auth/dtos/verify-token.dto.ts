import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class VerifyTokenDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address associated with the user account',
  })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({
    example: 'verification-token-12345',
    description: 'The verification token to be verified',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class VerifyTokenResetPasswordDto extends VerifyTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'newPassword123',
    description: 'The new password for resetting the user account',
  })
  password: string;
}
