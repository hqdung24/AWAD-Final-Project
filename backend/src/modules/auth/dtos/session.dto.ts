export interface SessionData {
  userId: string;
  refreshTokenHash: string;
  device?: string;
  createdAt: number;
  expiresAt: number;
}

export interface Session extends SessionData {
  sessionId: string;
}

export interface CreateSessionParams {
  userId: string;
  refreshToken: string;
  device?: string;
  expiresInSeconds?: number;
}
