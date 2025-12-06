import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bus } from './entities/bus.entity';

@Injectable()
export class BusRepository {
  constructor(
    @InjectRepository(Bus)
    private readonly repository: Repository<Bus>,
  ) {}

  async findById(id: string): Promise<Bus | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['operator'],
    });
  }

  async findAll(filters: {
    operatorId?: string;
    isActive?: boolean;
    page: number;
    limit: number;
  }): Promise<[Bus[], number]> {
    const { operatorId, isActive = true, page, limit } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('bus')
      .leftJoinAndSelect('bus.operator', 'operator')
      .skip(skip)
      .take(limit)
      .orderBy('bus.plateNumber', 'ASC');

    if (operatorId) {
      queryBuilder.andWhere('bus.operatorId = :operatorId', { operatorId });
    }

    queryBuilder.andWhere('bus.isActive = :isActive', { isActive });

    return await queryBuilder.getManyAndCount();
  }

  async create(busData: Partial<Bus>): Promise<Bus> {
    const bus = this.repository.create(busData);
    return await this.repository.save(bus);
  }

  async update(id: string, updateData: Partial<Bus>): Promise<Bus | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async softDelete(id: string): Promise<Bus | null> {
    await this.repository.update(id, {
      isActive: false,
      deletedAt: new Date(),
    });
    return await this.findById(id);
  }

  async save(bus: Bus): Promise<Bus> {
    return await this.repository.save(bus);
  }
}
