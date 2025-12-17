import { Controller, Get, Header, Res } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { type Response } from 'express';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Auth(AuthType.None)
  @Header('Content-Type', 'text/plain; version=0.0.4')
  async getMetrics(@Res() res: Response) {
    const payload = await this.metricsService.getRegistry().metrics();
    res
      .status(200)
      .header('Content-Type', 'text/plain; version=0.0.4')
      .send(payload);
  }
}
