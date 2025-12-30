import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RealtimeService } from '../realtime.service';
import { type NotificationCreateEventPayload } from '@/modules/notification/dto/notification-event.dto';

@Injectable()
export class RealtimeNotificationListener {
  private readonly logger = new Logger(RealtimeNotificationListener.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  @OnEvent('notification.create')
  handleNotificationCreate(event: NotificationCreateEventPayload) {
    try {
      // Emit notification to connected websocket clients
      this.realtimeService.emitToUser(event.userId, 'notification:created', {
        type: event.type,
        payload: event.payload,
        channel: event.channel,
        timestamp: new Date(),
      });

      this.logger.log(
        `Emitted notification:created event to user ${event.userId} (type: ${event.type})`,
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to emit notification to user ${event.userId}: ${errorMessage}`,
      );
      // Don't throw - websocket emission failure shouldn't break the flow
    }
  }
}
