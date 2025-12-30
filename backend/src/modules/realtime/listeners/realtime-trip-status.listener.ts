import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RealtimeService } from '../realtime.service';
import type { Trip } from '@/modules/trip/entities/trip.entity';

type TripStatusUpdatedEvent = {
  tripId: string;
  oldStatus: string;
  newStatus: string;
  trip: Trip;
  timestamp: Date;
};

@Injectable()
export class RealtimeTripStatusListener {
  private readonly logger = new Logger(RealtimeTripStatusListener.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  @OnEvent('trip.status.updated')
  handleTripStatusUpdate(event: TripStatusUpdatedEvent) {
    try {
      // Broadcast trip status update to all connected clients
      this.realtimeService.broadcast('trip:status.updated', {
        tripId: event.tripId,
        oldStatus: event.oldStatus,
        newStatus: event.newStatus,
        trip: event.trip,
        timestamp: event.timestamp,
      });

      this.logger.log(
        `Broadcasted trip status update: trip ${event.tripId} ${event.oldStatus} → ${event.newStatus}`,
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Failed to broadcast trip status update for trip ${event.tripId}: ${errorMessage}`,
      );
    }
  }
}
