import { Injectable } from '@nestjs/common';
import { BookingRepository } from './booking.repository';

@Injectable()
export class BookingService {
  constructor(private readonly bookingRepository: BookingRepository) {}
}
