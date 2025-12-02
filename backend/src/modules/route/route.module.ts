import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Route } from './entities/route.entity';
import { RouteController } from './route.controller';
import { RouteService } from './route.service';
import { RouteRepository } from './route.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Route])],
  controllers: [RouteController],
  providers: [RouteService, RouteRepository],
  exports: [RouteService, RouteRepository],
})
export class RouteModule {}
