import { Injectable } from '@nestjs/common';
import { BusRepository } from './bus.repository';

@Injectable()
export class BusService {
  constructor(private readonly busRepository: BusRepository) {}
}
