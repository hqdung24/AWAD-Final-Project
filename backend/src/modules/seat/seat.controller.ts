import { Controller } from '@nestjs/common';
import { SeatService } from './seat.service';

@Controller('seat')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}
}
