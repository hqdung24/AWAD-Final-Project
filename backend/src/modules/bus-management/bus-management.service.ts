import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  BUS_DATA_PROVIDER,
  type BusDataProvider,
  type BusRecord,
  type BusAssignmentRecord,
} from './providers/bus-data.provider';
import { CreateBusDto, UpdateBusDto, BusAssignmentDto } from './dtos/bus.dto';

@Injectable()
export class BusManagementService {
  constructor(
    @Inject(BUS_DATA_PROVIDER)
    private readonly busProvider: BusDataProvider,
  ) {}

  listBuses(): Promise<BusRecord[]> {
    return this.busProvider.listBuses();
  }

  async createBus(dto: CreateBusDto): Promise<BusRecord> {
    return this.busProvider.createBus(dto);
  }

  async updateBus(id: string, dto: UpdateBusDto): Promise<BusRecord> {
    try {
      return await this.busProvider.updateBus(id, dto);
    } catch (e) {
      throw new NotFoundException('Bus not found');
    }
  }

  async deleteBus(id: string): Promise<void> {
    await this.busProvider.deleteBus(id);
  }

  listAssignments(busId?: string): Promise<BusAssignmentRecord[]> {
    return this.busProvider.listAssignments(busId);
  }

  async assignBus(busId: string, dto: BusAssignmentDto): Promise<BusAssignmentRecord> {
    try {
      return await this.busProvider.assignBus({
        busId,
        routeId: dto.routeId,
        startTime: dto.startTime,
        endTime: dto.endTime,
      });
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }

  async deleteAssignment(id: string): Promise<void> {
    await this.busProvider.deleteAssignment(id);
  }
}
