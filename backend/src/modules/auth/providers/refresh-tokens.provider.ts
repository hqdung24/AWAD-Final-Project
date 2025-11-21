import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type ConfigType } from '@nestjs/config';
import { jwtConfig } from '@/modules/auth/config/jwt.config';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { UsersService } from '@/modules/users/providers/users.service';
@Injectable()
export class RefreshTokensProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    private readonly generateTokensProvider: GenerateTokensProvider,

    private readonly usersService: UsersService,
  ) {}

  public async refreshToken(refreshToken: string) {
    try {
      //verify refresh token
      const { sub }: Partial<ActiveUserData> =
        await this.jwtService.verifyAsync(refreshToken, {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
        });

      //fetch user data from database
      if (!sub) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const user = await this.usersService.findOneById(sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return this.generateTokensProvider.generateTokens(user);

      //generate new access token with user data
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
