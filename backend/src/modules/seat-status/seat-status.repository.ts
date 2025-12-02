import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeatStatus } from './entities/seat-status.entity';

@Injectable()
export class SeatStatusRepository {
  constructor(
    @InjectRepository(SeatStatus)
    private readonly repository: Repository<SeatStatus>,
  ) {}
}
