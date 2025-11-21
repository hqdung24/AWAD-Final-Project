import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type ConfigType } from '@nestjs/config';
import { jwtConfig } from '@/modules/auth/config/jwt.config';
import { User } from '@/modules/users/user.entity';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
@Injectable()
export class GenerateTokensProvider {
  constructor(
    //inject JWT service
    private readonly jwtService: JwtService,

    //inject jwt config
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}
  public async signToken(
    userId: string,
    expiresIn: number,
    payload?: Partial<ActiveUserData>,
  ) {
    const token = await this.jwtService.signAsync(
      { sub: userId, ...payload },
      {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
        expiresIn: expiresIn,
      },
    );

    return token;
  }

  public async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      //generate access token
      this.signToken(user.id, this.jwtConfiguration.accessTokenTtl, {
        email: user.email,
        role: user.role,
      }),
      //generate refresh token
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);

    return { accessToken, refreshToken };
  }
}
