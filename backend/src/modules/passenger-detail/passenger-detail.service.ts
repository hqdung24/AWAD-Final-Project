import { Injectable } from '@nestjs/common';
import { PassengerDetailRepository } from './passenger-detail.repository';

@Injectable()
export class PassengerDetailService {
  constructor(
    private readonly passengerDetailRepository: PassengerDetailRepository,
  ) {}
}
