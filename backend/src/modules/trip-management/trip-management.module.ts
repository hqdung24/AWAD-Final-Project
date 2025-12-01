import { Module } from '@nestjs/common';
import { TripManagementController } from './trip-management.controller';
import { TripManagementService } from './trip-management.service';
import { TRIP_DATA_PROVIDER } from './providers/trip-data.provider';
import { InMemoryTripProvider } from './providers/in-memory-trip.provider';

@Module({
  controllers: [TripManagementController],
  providers: [
    TripManagementService,
    {
      provide: TRIP_DATA_PROVIDER,
      useClass: InMemoryTripProvider, // swap with DB-backed provider later
    },
  ],
  exports: [TripManagementService, TRIP_DATA_PROVIDER],
})
export class TripManagementModule {}
