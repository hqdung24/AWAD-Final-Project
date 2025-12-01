import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ROUTE_DATA_PROVIDER,
  type RouteDataProvider,
  type RouteRecord,
} from './providers/route-data.provider';
import { CreateRouteDto, UpdateRouteDto } from './dtos/route.dto';

@Injectable()
export class AdminRoutesService {
  constructor(
    @Inject(ROUTE_DATA_PROVIDER)
    private readonly routeDataProvider: RouteDataProvider,
  ) {}

  list(): Promise<RouteRecord[]> {
    return this.routeDataProvider.list();
  }

  async get(id: string): Promise<RouteRecord> {
    const found = await this.routeDataProvider.findById(id);
    if (!found) throw new NotFoundException('Route not found');
    return found;
  }

  create(payload: CreateRouteDto): Promise<RouteRecord> {
    return this.routeDataProvider.create({
      ...payload,
      stops: payload.stops?.map((s) => ({
        id: s.id ?? '',
        name: s.name,
        type: s.type,
        order: s.order,
        note: s.note,
      })),
    });
  }

  async update(id: string, payload: UpdateRouteDto): Promise<RouteRecord> {
    await this.get(id); // ensure exists
    return this.routeDataProvider.update(id, {
      ...payload,
      stops:
        (payload as any)?.stops?.map((s: any) => ({
          id: s.id ?? '',
          name: s.name,
          type: s.type,
          order: s.order,
          note: s.note,
        })) ?? undefined,
    });
  }

  async remove(id: string): Promise<void> {
    await this.get(id);
    await this.routeDataProvider.delete(id);
  }
}
