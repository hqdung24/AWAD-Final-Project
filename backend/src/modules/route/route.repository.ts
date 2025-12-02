import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Route } from './entities/route.entity';

@Injectable()
export class RouteRepository {
  constructor(
    @InjectRepository(Route)
    private readonly repository: Repository<Route>,
  ) {}
}
