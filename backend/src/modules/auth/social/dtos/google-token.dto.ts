import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleTokenDto {
  @ApiProperty({
    description:
      'Google OAuth2 token, obtained from client-side authentication',
    example: 'ya29.a0ARrdaM...',
  })
  @IsNotEmpty()
  @IsString()
  readonly token: string;
}
