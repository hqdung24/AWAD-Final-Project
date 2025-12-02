import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutePoint } from '../entities/route-point.entity';

@Injectable()
export class RoutePointRepository {
  constructor(
    @InjectRepository(RoutePoint)
    private readonly repository: Repository<RoutePoint>,
  ) {}

  async findById(id: string): Promise<RoutePoint | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['route'],
    });
  }

  async findByRouteId(routeId: string): Promise<RoutePoint[]> {
    return await this.repository.find({
      where: { routeId },
      order: { orderIndex: 'ASC' },
    });
  }

  async create(routePointData: Partial<RoutePoint>): Promise<RoutePoint> {
    const routePoint = this.repository.create(routePointData);
    return await this.repository.save(routePoint);
  }

  async update(
    id: string,
    updateData: Partial<RoutePoint>,
  ): Promise<RoutePoint | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async save(routePoint: RoutePoint): Promise<RoutePoint> {
    return await this.repository.save(routePoint);
  }
}
