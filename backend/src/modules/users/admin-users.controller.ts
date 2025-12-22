import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';
import { UsersService } from './providers/users.service';
import { CreateAdminUserDto } from './dtos/create-admin-user.dto';
import { UpdateAdminUserDto } from './dtos/update-admin-user.dto';
import { AdminUserQueryDto } from './dtos/admin-user-query.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List admin accounts' })
  async listAdmins(@Query() query: AdminUserQueryDto) {
    return await this.usersService.listAdmins(query);
  }

  @Post()
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create admin account' })
  async createAdmin(@Body() payload: CreateAdminUserDto) {
    return await this.usersService.createAdmin(payload);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update admin account' })
  async updateAdmin(
    @Param('id') id: string,
    @Body() payload: UpdateAdminUserDto,
  ) {
    return await this.usersService.updateAdmin(id, payload);
  }

  @Patch(':id/deactivate')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate admin account' })
  async deactivateAdmin(@Param('id') id: string) {
    return await this.usersService.deactivateAdmin(id);
  }
}
