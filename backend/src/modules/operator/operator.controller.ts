import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OperatorService } from './operator.service';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

@ApiTags('Admin - Operators')
@ApiBearerAuth()
@Controller('admin/operators')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List operators' })
  async listOperators() {
    return await this.operatorService.findAll();
  }
}
