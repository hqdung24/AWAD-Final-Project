import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassengerDetail } from './entities/passenger-detail.entity';

@Injectable()
export class PassengerDetailRepository {
  constructor(
    @InjectRepository(PassengerDetail)
    private readonly repository: Repository<PassengerDetail>,
  ) {}
}
