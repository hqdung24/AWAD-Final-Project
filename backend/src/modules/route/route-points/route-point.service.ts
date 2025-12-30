import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RoutePointRepository } from './route-point.repository';
import { RouteService } from '../route.service';
import { CreateRoutePointDto } from './dto/create-route-point.dto';
import { UpdateRoutePointDto } from './dto/update-route-point.dto';
import { RoutePoint } from '../entities/route-point.entity';

@Injectable()
export class RoutePointService {
  constructor(
    private readonly routePointRepository: RoutePointRepository,
    private readonly routeService: RouteService,
  ) {}

  async addRoutePoint(
    routeId: string,
    createRoutePointDto: CreateRoutePointDto,
  ): Promise<RoutePoint> {
    // Validate route exists
    const route = await this.routeService.findById(routeId);
    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    const existingPoints = await this.routePointRepository.findByRouteId(routeId);
    const orderIndex = createRoutePointDto.orderIndex ?? 0;
    const hasDuplicateOrder = existingPoints.some(
      (point) =>
        point.type === createRoutePointDto.type &&
        point.orderIndex === orderIndex,
    );
    if (hasDuplicateOrder) {
      throw new BadRequestException(
        `Route point order ${orderIndex} already exists for ${createRoutePointDto.type}`,
      );
    }

    return await this.routePointRepository.create({
      routeId,
      ...createRoutePointDto,
      orderIndex,
    });
  }

  async updateRoutePoint(
    id: string,
    updateRoutePointDto: UpdateRoutePointDto,
  ): Promise<RoutePoint> {
    // Check if route point exists
    const existingPoint = await this.routePointRepository.findById(id);
    if (!existingPoint) {
      throw new NotFoundException(`Route point with ID ${id} not found`);
    }

    if (
      updateRoutePointDto.orderIndex !== undefined ||
      updateRoutePointDto.type !== undefined
    ) {
      const newType = updateRoutePointDto.type ?? existingPoint.type;
      const newOrder =
        updateRoutePointDto.orderIndex ?? existingPoint.orderIndex ?? 0;
      const points = await this.routePointRepository.findByRouteId(
        existingPoint.routeId,
      );
      const hasDuplicateOrder = points.some(
        (point) =>
          point.id !== existingPoint.id &&
          point.type === newType &&
          point.orderIndex === newOrder,
      );
      if (hasDuplicateOrder) {
        throw new BadRequestException(
          `Route point order ${newOrder} already exists for ${newType}`,
        );
      }
    }

    // Update route point
    const updated = await this.routePointRepository.update(
      id,
      updateRoutePointDto,
    );

    if (!updated) {
      throw new NotFoundException(`Route point with ID ${id} not found`);
    }

    return updated;
  }

  async deleteRoutePoint(id: string): Promise<void> {
    // Check if route point exists
    const existingPoint = await this.routePointRepository.findById(id);
    if (!existingPoint) {
      throw new NotFoundException(`Route point with ID ${id} not found`);
    }

    await this.routePointRepository.delete(id);
  }

  async getRoutePoints(routeId: string): Promise<RoutePoint[]> {
    return await this.routePointRepository.findByRouteId(routeId);
  }

  async findById(id: string): Promise<RoutePoint | null> {
    return await this.routePointRepository.findById(id);
  }
}
