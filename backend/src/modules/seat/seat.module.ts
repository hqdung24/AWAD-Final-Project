import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { SeatController } from './seat.controller';
import { SeatService } from './seat.service';
import { SeatRepository } from './seat.repository';
import { forwardRef } from '@nestjs/common';
import { BusModule } from '../bus/bus.module';
import { SeatSelectingProvider } from '../seat-status/providers/seat-selecting.provider';
import { RedisModule } from '../redis/redis.module';
import { TripModule } from '../trip/trip.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Seat]),
    forwardRef(() => BusModule),
    forwardRef(() => TripModule),
    RedisModule,
  ],
  controllers: [SeatController],
  providers: [SeatService, SeatRepository, SeatSelectingProvider],
  exports: [SeatService, SeatRepository, SeatSelectingProvider],
})
export class SeatModule {}
