import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { RoutePoint } from './entities/route-point.entity';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { RouteRepository } from './route.repository';
import { RoutePointController } from './route-points/route-point.controller';
import { RoutePointService } from './route-points/route-point.service';
import { RoutePointRepository } from './route-points/route-point.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Route, RoutePoint])],
  controllers: [RouteController, RoutePointController],
  providers: [
    RouteService,
    RouteRepository,
    RoutePointService,
    RoutePointRepository,
  ],
  exports: [RouteService, RoutePointService],
})
export class RouteModule {}
