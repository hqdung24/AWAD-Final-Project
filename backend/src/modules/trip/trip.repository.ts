import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';

@Injectable()
export class TripRepository {
  constructor(
    @InjectRepository(Trip)
    private readonly repository: Repository<Trip>,
  ) {}
}
