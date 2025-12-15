import { Injectable } from '@nestjs/common';
import { OperatorRepository } from './operator.repository';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@Injectable()
export class OperatorService {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async findAll() {
    return await this.operatorRepository.findAll();
  }

  async findOne(id: string) {
    return await this.operatorRepository.findOne(id);
  }

  async create(payload: CreateOperatorDto) {
    return await this.operatorRepository.createOperator(payload);
  }

  async update(id: string, payload: UpdateOperatorDto) {
    return await this.operatorRepository.updateOperator(id, payload);
  }

  async remove(id: string) {
    await this.operatorRepository.deleteOperator(id);
  }
}
