import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operator } from './entities/operator.entity';
import { OperatorController } from './operator.controller';
import { OperatorService } from './operator.service';
import { OperatorRepository } from './operator.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Operator])],
  controllers: [OperatorController],
  providers: [OperatorService, OperatorRepository],
  exports: [OperatorService, OperatorRepository],
})
export class OperatorModule {}
