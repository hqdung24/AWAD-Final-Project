import { Module } from '@nestjs/common';
import { BusManagementController } from './bus-management.controller';
import { BusManagementService } from './bus-management.service';
import { BUS_DATA_PROVIDER } from './providers/bus-data.provider';
import { InMemoryBusProvider } from './providers/in-memory-bus.provider';

@Module({
  controllers: [BusManagementController],
  providers: [
    BusManagementService,
    {
      provide: BUS_DATA_PROVIDER,
      useClass: InMemoryBusProvider, // swap to DB provider later
    },
  ],
  exports: [BusManagementService, BUS_DATA_PROVIDER],
})
export class BusManagementModule {}
