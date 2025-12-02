import { Controller } from '@nestjs/common';
import { RouteService } from './route.service';

@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}
}
