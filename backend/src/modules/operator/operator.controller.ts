import { Controller } from '@nestjs/common';
import { OperatorService } from './operator.service';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}
}
