import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('admin')
  @Roles(RoleType.ADMIN)
  async getAdminReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('operatorId') operatorId?: string,
    @Query('routeId') routeId?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    return this.reportService.getAdminReport({
      from,
      to,
      operatorId,
      routeId,
      groupBy,
    });
  }

  @Get('admin/export')
  @Roles(RoleType.ADMIN)
  async exportAdminReport(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('operatorId') operatorId?: string,
    @Query('routeId') routeId?: string,
    @Query('groupBy') groupBy?: 'day' | 'week' | 'month',
  ) {
    const csv = await this.reportService.exportAdminReport({
      from,
      to,
      operatorId,
      routeId,
      groupBy,
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${Date.now()}.csv"`,
    );
    res.send(csv);
  }
}
