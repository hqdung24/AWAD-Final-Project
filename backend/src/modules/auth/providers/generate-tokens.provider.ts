import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type ConfigType } from '@nestjs/config';
import { jwtConfig } from '@/config/jwt.config';
import { User } from '@/modules/users/entities/user.entity';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import * as crypto from 'crypto';
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

  public async generateTokens(user: User): Promise<{ accessToken: string }> {
    const accessToken = await this.signToken(
      user.id,
      this.jwtConfiguration.accessTokenTtl,
      {
        email: user.email,
        role: user.role,
      },
    );

    return { accessToken };
  }

  public generateRandomToken(): string {
    const randomToken = crypto.randomBytes(32).toString('hex');
    return randomToken;
  }
}
