import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/decorator/roles.decorator';
import { RoleType } from '../auth/enums/roles-type.enum';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(RoleType.ADMIN)
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('user')
  @Auth(AuthType.Bearer)
  @Roles(RoleType.USER, RoleType.ADMIN)
  getUserDashboard() {
    return this.dashboardService.getUserDashboard();
  }
}
