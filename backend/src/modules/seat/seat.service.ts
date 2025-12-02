import { Injectable } from '@nestjs/common';
import { SeatRepository } from './seat.repository';

@Injectable()
export class SeatService {
  constructor(private readonly seatRepository: SeatRepository) {}
}
