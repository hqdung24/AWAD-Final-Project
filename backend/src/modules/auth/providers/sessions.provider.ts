import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import * as crypto from 'crypto';
import { RedisService } from '@/modules/redis/redis.service';
import { Session, SessionData, CreateSessionParams } from '../dtos/session.dto';
import { DEFAULT_SESSION_EXPIRY_SECONDS } from '../constant/session.constant';

@Injectable()
export class SessionsProvider {
  constructor(
    private readonly hashingProvider: HashingProvider,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Create a new session
   */
  async createSession(
    params: CreateSessionParams,
  ): Promise<{ sessionId: string }> {
    const sessionId = crypto.randomUUID();
    const expiresInSeconds =
      params.expiresInSeconds || DEFAULT_SESSION_EXPIRY_SECONDS;
    const now = Date.now();

    // Hash the refresh token for storage
    const refreshTokenHash = await this.hashingProvider.hash(
      params.refreshToken,
    );

    const sessionData: SessionData = {
      userId: params.userId,
      refreshTokenHash,
      device: params.device,
      createdAt: now,
      expiresAt: now + expiresInSeconds * 1000,
    };

    const sessionKey = `session:${sessionId}`;
    await this.redisService.set(
      sessionKey,
      JSON.stringify(sessionData),
      expiresInSeconds,
    );

    return { sessionId };
  }

  /**
   * Validate and retrieve a session
   */
  async validateSession(sessionId: string): Promise<Session> {
    const sessionKey = `session:${sessionId}`;
    const sessionJson = await this.redisService.get(sessionKey);

    if (!sessionJson) {
      throw new UnauthorizedException('Session not found or expired');
    }

    const sessionData: SessionData = JSON.parse(sessionJson) as SessionData;

    // Check if session has expired
    if (sessionData.expiresAt < Date.now()) {
      await this.redisService.del(sessionKey);
      throw new UnauthorizedException('Session expired');
    }

    return {
      sessionId,
      ...sessionData,
    };
  }

  /**
   * Validate refresh token against stored hash
   */
  async validateRefreshToken(
    sessionId: string,
    refreshToken: string,
  ): Promise<void> {
    const session = await this.validateSession(sessionId);

    const isValid = await this.hashingProvider.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!isValid) {
      // Invalidate session on failed validation
      await this.destroySession(sessionId);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Rotate refresh token (issue new one, invalidate old)
   */
  async rotateRefreshToken(
    sessionId: string,
    newRefreshToken: string,
  ): Promise<void> {
    const session = await this.validateSession(sessionId);

    // Hash the new refresh token
    const newRefreshTokenHash =
      await this.hashingProvider.hash(newRefreshToken);

    // Update session with new token hash
    const sessionKey = `session:${sessionId}`;
    const updatedSessionData: SessionData = {
      ...session,
      refreshTokenHash: newRefreshTokenHash,
    };

    const ttl = Math.ceil((session.expiresAt - Date.now()) / 1000);
    await this.redisService.set(
      sessionKey,
      JSON.stringify(updatedSessionData),
      ttl > 0 ? ttl : 1,
    );
  }

  /**
   * Destroy a session
   */
  async destroySession(sessionId: string): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.redisService.del(sessionKey);
  }
}
