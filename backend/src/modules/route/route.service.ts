import { Injectable } from '@nestjs/common';
import { RouteRepository } from './route.repository';
import { Route } from './entities/route.entity';

@Injectable()
export class RouteService {
  constructor(private readonly routeRepository: RouteRepository) {}

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
    return await this.routeRepository.update(id, updateData);
  }

  async softDelete(id: string): Promise<Route | null> {
    return await this.routeRepository.softDelete(id);
  }
}
