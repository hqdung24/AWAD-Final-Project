import { Controller } from '@nestjs/common';
import { SeatStatusService } from './seat-status.service';

@Controller('seat-status')
export class SeatStatusController {
  constructor(private readonly seatStatusService: SeatStatusService) {}
}
