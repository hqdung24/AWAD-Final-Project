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

  async findById(id: string): Promise<Route | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(filters: {
    operatorId?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }): Promise<[Route[], number]> {
    const { operatorId, isActive, page, limit } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('route')
      .leftJoinAndSelect('route.operator', 'operator')
      .skip(skip)
      .take(limit)
      .orderBy('route.origin', 'ASC');

    if (operatorId) {
      queryBuilder.andWhere('route.operatorId = :operatorId', { operatorId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('route.isActive = :isActive', { isActive });
    }

    return await queryBuilder.getManyAndCount();
  }

  async create(routeData: Partial<Route>): Promise<Route> {
    const route = this.repository.create(routeData);
    return await this.repository.save(route);
  }

  async update(id: string, updateData: Partial<Route>): Promise<Route | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<Route | null> {
    await this.repository.update(id, {
      isActive: false,
      deletedAt: new Date(),
    });
    return await this.findById(id);
  }

  async save(route: Route): Promise<Route> {
    return await this.repository.save(route);
  }
}
