import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RouteRepository } from './route.repository';
import { Route } from './entities/route.entity';

@Injectable()
export class RouteService {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findById(id: string): Promise<Route | null> {
    return await this.routeRepository.findById(id);
  }

  async findAll(filters: {
    operatorId?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }): Promise<[Route[], number]> {
    return await this.routeRepository.findAll(filters);
  }

  async create(routeData: Partial<Route>): Promise<Route> {
    return await this.routeRepository.create(routeData);
  }

  async update(id: string, updateData: Partial<Route>): Promise<Route | null> {
    const existing = await this.findById(id);
    const updated = await this.routeRepository.update(id, updateData);
    if (existing?.isActive && updateData.isActive === false) {
      this.eventEmitter.emit('route.deactivated', { routeId: id });
    }
    return updated;
  }

  async softDelete(id: string): Promise<Route | null> {
    const updated = await this.routeRepository.softDelete(id);
    if (updated?.isActive === false) {
      this.eventEmitter.emit('route.deactivated', { routeId: id });
    }
    return updated;
  }
}
