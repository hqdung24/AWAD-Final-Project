import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class TicketTokenService {
  /**
   * Generate a cryptographically secure random token
   */
  generateRawToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Hash a token using SHA-256
   */
  hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  /**
   * Generate and hash a new token
   */
  generateToken(): {
    rawToken: string;
    tokenHash: string;
  } {
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    return { rawToken, tokenHash };
  }
}
