import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripRepository } from './trip.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Trip])],
  controllers: [TripController],
  providers: [TripService, TripRepository],
  exports: [TripService, TripRepository],
})
export class TripModule {}
