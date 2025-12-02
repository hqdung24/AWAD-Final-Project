import { Injectable } from '@nestjs/common';
import { RouteRepository } from './route.repository';

@Injectable()
export class RouteService {
  constructor(private readonly routeRepository: RouteRepository) {}
}
