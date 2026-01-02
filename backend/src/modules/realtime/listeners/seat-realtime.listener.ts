import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RealtimeService } from '../realtime.service';

type SeatReleasedEvent = {
  tripId: string;
  seatId: string;
  timestamp: Date;
};

@Injectable()
export class SeatRealtimeListener {
  private readonly logger = new Logger(SeatRealtimeListener.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  @OnEvent('seat.released')
  handleSeatReleased(event: SeatReleasedEvent) {
    try {
      // Broadcast seat released event to trip room
      // Same format as realtime.gateway.ts handleSeatRelease()
      this.realtimeService.broadcast(`seat:released`, {
        tripId: event.tripId,
        seatId: event.seatId,
        timestamp: event.timestamp,
      });

      this.logger.log(
        `[REALTIME] Broadcast seat:released - trip=${event.tripId} seat=${event.seatId}`,
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to broadcast seat released event: ${errorMessage}`,
      );
      // Don't throw - realtime broadcast failure shouldn't break the flow
    }
  }
}
