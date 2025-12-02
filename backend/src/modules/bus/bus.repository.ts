import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from './entities/bus.entity';

@Injectable()
export class BusRepository {
  constructor(
    @InjectRepository(Bus)
    private readonly repository: Repository<Bus>,
  ) {}
}
