import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { SeatController } from './seat.controller';
import { SeatService } from './seat.service';
import { SeatRepository } from './seat.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Seat])],
  controllers: [SeatController],
  providers: [SeatService, SeatRepository],
  exports: [SeatService, SeatRepository],
})
export class SeatModule {}
