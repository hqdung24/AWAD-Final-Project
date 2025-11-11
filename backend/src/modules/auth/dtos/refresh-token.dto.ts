import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token issued to the user, to get a new access token',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
