import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Operator } from './entities/operator.entity';

@Injectable()
export class OperatorRepository {
  constructor(
    @InjectRepository(Operator)
    private readonly repository: Repository<Operator>,
  ) {}

  async findAll(): Promise<Operator[]> {
    return await this.repository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Operator | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async createOperator(data: Partial<Operator>): Promise<Operator> {
    const op = this.repository.create(data);
    return await this.repository.save(op);
  }

  async updateOperator(
    id: string,
    data: Partial<Operator>,
  ): Promise<Operator | null> {
    const existing = await this.findOne(id);
    if (!existing) return null;
    Object.assign(existing, data);
    return await this.repository.save(existing);
  }

  async deleteOperator(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
