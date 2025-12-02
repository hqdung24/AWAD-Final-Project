import { Injectable } from '@nestjs/common';
import { SeatStatusRepository } from './seat-status.repository';

@Injectable()
export class SeatStatusService {
  constructor(private readonly seatStatusRepository: SeatStatusRepository) {}
}
