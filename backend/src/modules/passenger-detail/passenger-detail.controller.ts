import { Controller } from '@nestjs/common';
import { PassengerDetailService } from './passenger-detail.service';

@Controller('passenger-detail')
export class PassengerDetailController {
  constructor(
    private readonly passengerDetailService: PassengerDetailService,
  ) {}
}
