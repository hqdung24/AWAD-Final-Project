import { Injectable } from '@nestjs/common';
import { TripRepository } from './trip.repository';

@Injectable()
export class TripService {
  constructor(private readonly tripRepository: TripRepository) {}
}
