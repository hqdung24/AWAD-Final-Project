import { Injectable, Logger } from '@nestjs/common';
import { ISocketUser } from './interfaces/socket-event.interface';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private connectedUsers = new Map<string, ISocketUser>();

  registerUser(userId: string, socketId: string): void {
    this.connectedUsers.set(socketId, {
      userId,
      socketId,
      connectedAt: new Date(),
    });
    this.logger.log(`User ${userId} connected with socket ${socketId}`);
  }

  unregisterUser(socketId: string): void {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      this.connectedUsers.delete(socketId);
      this.logger.log(
        `User ${user.userId} disconnected from socket ${socketId}`,
      );
    }
  }

  getUser(socketId: string): ISocketUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  getUserIdBySocketId(socketId: string): string | undefined {
    return this.connectedUsers.get(socketId)?.userId;
  }

  getAllConnectedUsers(): ISocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  isUserOnline(userId: string): boolean {
    return Array.from(this.connectedUsers.values()).some(
      (user) => user.userId === userId,
    );
  }

  getSocketIdsByUserId(userId: string): string[] {
    return Array.from(this.connectedUsers.values())
      .filter((user) => user.userId === userId)
      .map((user) => user.socketId);
  }
}
