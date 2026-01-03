import { Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';
import { SeatSelectingProvider } from '@/modules/seat-status/providers/seat-selecting.provider';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { TripRoomDto } from './dto/trip-room.dto';
import { SeatSelectDto } from './dto/seat-select.dto';
import { SeatReleaseDto } from './dto/seat-release.dto';
import { WsGlobalExceptionFilter } from '@/common/filters/ws-exceptions.filter';

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3900'];
@UseFilters(WsGlobalExceptionFilter)
@Auth(AuthType.None)
@WebSocketGateway({
  namespace: 'realtime',
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly seatSelectingProvider: SeatSelectingProvider,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway Initialized');
    // Attach the server instance to the service so other modules can emit
    this.realtimeService.attachServer(this.server);
  }

  handleConnection(@ConnectedSocket() socket: Socket) {
    const userIdFromClient = socket.handshake.auth?.userId as
      | string
      | undefined;
    const guestId = socket.handshake.auth?.guestId as string | undefined;

    const socketId = socket.id;
    this.logger.log(` Handshake occurs for socket ${socketId}`);
    const userId = userIdFromClient ?? (guestId ? `guest:${guestId}` : null);
    if (!userId) {
      this.logger.warn(`Client connected without userId/guestId: ${socketId}`);
      socket.disconnect(true);
      return;
    }
    if (userId) {
      this.realtimeService.registerUser(userId, socketId);

      // Broadcast user online status
      this.server.emit('user:online', {
        userId,
        timestamp: new Date(),
      });
    } else {
      this.logger.warn(
        `Client connected with invalid token (no sub): ${socketId}`,
      );
      socket.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userId = this.realtimeService.getUserIdBySocketId(socket.id);
    this.realtimeService.unregisterUser(socket.id);

    if (userId) {
      // Broadcast user offline status
      this.server.emit('user:offline', {
        userId,
        timestamp: new Date(),
      });
    }
  }

  // Helper method to emit to specific user
  emitToUser(userId: string, event: string, data: any): void {
    const socketIds = this.realtimeService.getSocketIdsByUserId(userId);
    socketIds.forEach((socketId) => {
      this.server.to(socketId).emit(event, data);
    });
  }

  // Helper method to emit to room
  emitToRoom(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
  }

  // Helper method to broadcast to all
  broadcastToAll(event: string, data: any): void {
    this.server.emit(event, data);
  }

  // Generic message handler
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ): void {
    this.logger.log(`Message from ${socket.id}:`, data);
    // Handle generic messages here
    socket.broadcast.emit('message', {
      userId: this.realtimeService.getUserIdBySocketId(socket.id),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data,
      timestamp: new Date(),
    });
  }

  // Ping-Pong handler
  @SubscribeMessage('ping')
  handlePing(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: any,
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    socket.emit('pong', { data, timestamp: new Date() });
  }

  // ------------------------------------- Trip room management ---------------------------------------------

  // Join trip room
  @SubscribeMessage('trip:join')
  async handleTripJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: TripRoomDto,
  ): Promise<void> {
    const { tripId } = data;
    const room = `trip:${tripId}`;

    await socket.join(room);
    this.logger.log(`Socket ${socket.id} joined room ${room}`);

    socket.emit('trip:joined', {
      tripId,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('trip:leave')
  async handleTripLeave(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: TripRoomDto,
  ): Promise<void> {
    const { tripId } = data;
    const room = `trip:${tripId}`;

    await socket.leave(room);
    this.logger.log(`Socket ${socket.id} left room ${room}`);
  }

  // Seat selection handlers
  @SubscribeMessage('seat:select')
  async handleSeatSelect(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SeatSelectDto,
  ): Promise<void> {
    const { tripId, seatId } = data;
    const userId = this.realtimeService.getUserIdBySocketId(socket.id);

    if (!userId) {
      this.logger.warn(
        `Seat select without mapped userId. Socket ${socket.id}`,
      );
      throw new WsException('UNAUTHORIZED');
    }

    if (!socket.rooms.has(`trip:${tripId}`)) {
      throw new WsException('NOT_IN_TRIP_ROOM');
    }

    const success = await this.seatSelectingProvider.trySelectSeat(
      tripId,
      seatId,
      userId,
    );

    if (success) {
      this.server.to(`trip:${tripId}`).emit('seat:selected', {
        tripId,
        seatId,
        userId,
        timestamp: new Date(),
      });

      this.logger.log(
        `Seat ${seatId} selected by user ${userId} in trip ${tripId}`,
      );
      return;
    }

    this.logger.warn(
      `Seat ${seatId} selection failed for user ${userId} in trip ${tripId}`,
    );

    throw new WsException('SEAT_ALREADY_SELECTED');
  }

  @SubscribeMessage('seat:release')
  async handleSeatRelease(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SeatReleaseDto,
  ): Promise<void> {
    const { tripId, seatId } = data;
    const userId = this.realtimeService.getUserIdBySocketId(socket.id);

    if (!userId) {
      this.logger.warn(
        `Seat release without mapped userId. Socket ${socket.id}`,
      );
      throw new WsException('UNAUTHORIZED');
    }

    const released = await this.seatSelectingProvider.releaseSeat(
      tripId,
      seatId,
      userId,
    );

    if (released) {
      this.server.to(`trip:${tripId}`).emit('seat:released', {
        tripId,
        seatId,
        userId,
        timestamp: new Date(),
      });

      this.logger.log(
        `Seat ${seatId} released by user ${userId} in trip ${tripId}`,
      );
      return;
    }

    this.logger.warn(
      `Seat ${seatId} release failed for user ${userId} in trip ${tripId}`,
    );

    throw new WsException('SEAT_OWNERSHIP_FAILED');
  }
}
