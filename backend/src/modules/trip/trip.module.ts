import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripController, PublicTripController } from './trip.controller';
import { TripService } from './trip.service';
import { TripRepository } from './trip.repository';
import { TripValidationProvider } from './providers/trip-validation.provider';
import { SeatStatusGeneratorProvider } from './providers/seat-status-generator.provider';
import { TripSearchProvider } from './providers/trip-search.provider';
import { RouteModule } from '@/modules/route/route.module';
import { BusModule } from '@/modules/bus/bus.module';
import { SeatModule } from '@/modules/seat/seat.module';
import { SeatStatusModule } from '@/modules/seat-status/seat-status.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip]),
    RouteModule,
    BusModule,
    SeatModule,
    SeatStatusModule,
  ],
  controllers: [TripController, PublicTripController],
  providers: [
    TripService,
    TripRepository,
    TripValidationProvider,
    SeatStatusGeneratorProvider,
    TripSearchProvider,
  ],
  exports: [TripService, TripRepository],
})
export class TripModule {}
