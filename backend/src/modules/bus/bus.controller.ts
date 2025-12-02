import { Controller } from '@nestjs/common';
import { BusService } from './bus.service';

@Controller('bus')
export class BusController {
  constructor(private readonly busService: BusService) {}
}
