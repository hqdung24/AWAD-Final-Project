import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';

@Injectable()
export class SeatRepository {
  constructor(
    @InjectRepository(Seat)
    private readonly repository: Repository<Seat>,
  ) {}
}
