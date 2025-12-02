import { Injectable } from '@nestjs/common';
import { SeatService } from '@/modules/seat/seat.service';
import { SeatStatusService } from '@/modules/seat-status/seat-status.service';
import { SeatStatus } from '@/modules/seat-status/entities/seat-status.entity';

@Injectable()
export class SeatStatusGeneratorProvider {
  constructor(
    private readonly seatService: SeatService,
    private readonly seatStatusService: SeatStatusService,
  ) {}

  async generateSeatStatusesForTrip(
    tripId: string,
    busId: string,
  ): Promise<SeatStatus[]> {
    // Get all seats for the bus
    const seats = await this.seatService.findByBusId(busId);

    // Create seat status for each seat
    const seatStatuses: SeatStatus[] = [];

    for (const seat of seats) {
      const seatStatus = new SeatStatus();
      seatStatus.tripId = tripId;
      seatStatus.seatId = seat.id;
      seatStatus.state = 'available'; // default status
      seatStatus.lockedUntil = new Date(0); // default to epoch

      const saved = await this.seatStatusService.save(seatStatus);
      seatStatuses.push(saved);
    }

    return seatStatuses;
  }
}
