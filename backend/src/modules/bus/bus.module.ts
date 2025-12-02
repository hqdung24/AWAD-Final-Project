import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from './entities/bus.entity';
import { BusController } from './bus.controller';
import { BusService } from './bus.service';
import { BusRepository } from './bus.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Bus])],
  controllers: [BusController],
  providers: [BusService, BusRepository],
  exports: [BusService],
})
export class BusModule {}
