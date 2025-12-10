import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bus } from './entities/bus.entity';
import { BusController } from './bus.controller';
import { BusService } from './bus.service';
import { BusRepository } from './bus.repository';
import { forwardRef } from '@nestjs/common';
import { SeatModule } from '../seat/seat.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bus]), forwardRef(() => SeatModule)],
  controllers: [BusController],
  providers: [BusService, BusRepository],
  exports: [BusService],
})
export class BusModule {}
