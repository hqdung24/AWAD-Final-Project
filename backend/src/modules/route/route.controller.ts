import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RouteService } from './route.service';
import {
  CreateRouteDto,
  UpdateRouteDto,
  RouteQueryDto,
} from './dto/admin-route.dto';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

@ApiTags('Admin - Routes')
@ApiBearerAuth()
@Controller('admin/routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List routes' })
  @ApiResponse({ status: 200, description: 'Routes retrieved successfully' })
  async listRoutes(@Query() query: RouteQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
    const isActive = query.isActive ?? true;
    const [routes] = await this.routeService.findAll({
      operatorId: query.operatorId,
      isActive,
      page,
      limit,
    });

    return routes;
  }

  @Post()
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create route' })
  @ApiResponse({ status: 201, description: 'Route created successfully' })
  async createRoute(@Body() dto: CreateRouteDto) {
    return await this.routeService.create(dto);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update route' })
  @ApiResponse({ status: 200, description: 'Route updated successfully' })
  async updateRoute(@Param('id') id: string, @Body() dto: UpdateRouteDto) {
    return await this.routeService.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete route' })
  @ApiResponse({ status: 204, description: 'Route soft-deleted successfully' })
  async deleteRoute(@Param('id') id: string) {
    await this.routeService.softDelete(id);
  }
}
