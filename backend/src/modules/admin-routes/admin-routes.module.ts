import { Module } from '@nestjs/common';
import { AdminRoutesController } from './admin-routes.controller';
import { AdminRoutesService } from './admin-routes.service';
import { ROUTE_DATA_PROVIDER } from './providers/route-data.provider';
import { InMemoryRouteProvider } from './providers/in-memory-route.provider';

@Module({
  controllers: [AdminRoutesController],
  providers: [
    AdminRoutesService,
    {
      provide: ROUTE_DATA_PROVIDER,
      useClass: InMemoryRouteProvider, // swap this with a real provider later
    },
  ],
  exports: [AdminRoutesService, ROUTE_DATA_PROVIDER],
})
export class AdminRoutesModule {}
