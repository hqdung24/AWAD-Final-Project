// auth/dto/signin-response.dto.ts
import { Expose, Type } from 'class-transformer';

export class AuthUserDto {
  @Expose() id!: string;
  @Expose() email!: string;
  @Expose() firstName!: string;
  @Expose() lastName!: string;

  constructor(partial: Partial<AuthUserDto>) {
    Object.assign(this, partial);
  }
}

export class SignInResponseDto {
  @Expose() accessToken!: string;

  @Expose()
  @Type(() => AuthUserDto)
  user!: AuthUserDto;

  constructor(partial: Partial<SignInResponseDto>) {
    Object.assign(this, partial);
  }
}
