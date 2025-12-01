import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { RoleType } from '../auth/enums/roles-type.enum';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { AdminRoutesService } from './admin-routes.service';
import { CreateRouteDto, UpdateRouteDto } from './dtos/route.dto';

@ApiTags('Admin Routes')
@ApiBearerAuth('accessToken')
@Auth(AuthType.Bearer)
@Roles(RoleType.ADMIN)
@Controller('admin/routes')
export class AdminRoutesController {
  constructor(private readonly adminRoutesService: AdminRoutesService) {}

  @Get()
  @ApiOperation({ summary: 'List routes (mock-backed now, DB-ready later)' })
  list() {
    return this.adminRoutesService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by id' })
  get(@Param('id') id: string) {
    return this.adminRoutesService.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create route' })
  create(@Body() payload: CreateRouteDto) {
    return this.adminRoutesService.create(payload);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update route' })
  update(@Param('id') id: string, @Body() payload: UpdateRouteDto) {
    return this.adminRoutesService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete route' })
  remove(@Param('id') id: string) {
    return this.adminRoutesService.remove(id);
  }
}
