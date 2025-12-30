import { Injectable, Logger } from '@nestjs/common';
import { ISocketUser } from './interfaces/socket-event.interface';
import type { Server } from 'socket.io';
import type { Notification } from '@/modules/notification/entities/notification.entity';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private connectedUsers = new Map<string, ISocketUser>();
  private server?: Server;

  attachServer(server: Server): void {
    this.server = server;
    this.logger.log('Socket server attached to RealtimeService');
  }

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

  // ---------------------- Emit helpers ----------------------
  emitToUser(userId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.warn(
        `emitToUser skipped, server not attached. Event=${event} userId=${userId}`,
      );
      return;
    }
    const socketIds = this.getSocketIdsByUserId(userId);
    socketIds.forEach((socketId) => {
      this.server!.to(socketId).emit(event, data);
    });
  }

  broadcast(event: string, data: any): void {
    if (!this.server) {
      this.logger.warn(
        `broadcast skipped, server not attached. Event=${event}`,
      );
      return;
    }
    this.server.emit(event, data);
  }

  // Domain-specific emitter for notification creation
  emitNotificationCreated(userId: string, notification: Notification): void {
    this.emitToUser(userId, 'notification:created', {
      notification,
      timestamp: new Date(),
    });
  }
}
