import { Injectable } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { UsersService } from '@/modules/users/providers/users.service';
import { SessionsProvider } from './sessions.provider';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    private readonly generateTokensProvider: GenerateTokensProvider,

    private readonly usersService: UsersService,

    private readonly sessionsProvider: SessionsProvider,
  ) {}

  public async refreshToken(refreshTokenWithSession: string) {
    try {
      // Parse refreshToken format: "randomToken|sessionId"
      const [refreshToken, sessionId] = refreshTokenWithSession.split('|');

      if (!refreshToken || !sessionId) {
        throw new UnauthorizedException('Invalid refresh token format');
      }

      // Validate refresh token against session
      await this.sessionsProvider.validateRefreshToken(sessionId, refreshToken);

      // Get session to retrieve userId
      const session = await this.sessionsProvider.validateSession(sessionId);

      // Get user data
      const user = await this.usersService.findOneById(session.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new random refresh token
      const newRefreshToken = this.generateTokensProvider.generateRandomToken();

      // Rotate refresh token in session
      await this.sessionsProvider.rotateRefreshToken(
        sessionId,
        newRefreshToken,
      );

      // Generate new access token
      const { accessToken } =
        await this.generateTokensProvider.generateTokens(user);

      // Return new tokens (refresh token includes sessionId)
      const newRefreshTokenWithSession = `${newRefreshToken}|${sessionId}`;

      return { accessToken, refreshToken: newRefreshTokenWithSession };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
