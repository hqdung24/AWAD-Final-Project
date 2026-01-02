// auth/dto/signin-response.dto.ts
import { Expose, Type } from 'class-transformer';

export class AuthUserDto {
  @Expose() id!: string;
  @Expose() email!: string;
  @Expose() firstName!: string;
  @Expose() lastName!: string;
  @Expose() role!: string;
  @Expose() hasSetPassword!: boolean;
  @Expose() isActive!: boolean;
  @Expose() isVerified!: boolean;
  @Expose() phone?: string;
  @Expose() avatarUrl?: string;
  @Expose() username?: string;

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
