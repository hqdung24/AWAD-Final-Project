import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operator } from './entities/operator.entity';

@Injectable()
export class OperatorRepository {
  constructor(
    @InjectRepository(Operator)
    private readonly repository: Repository<Operator>,
  ) {}
}
