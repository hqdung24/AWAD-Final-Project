import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { RoutePointService } from './route-point.service';
import {
  CreateRoutePointDto,
  UpdateRoutePointDto,
  RouteIdParamDto,
  RoutePointIdParamDto,
} from './dto';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

@ApiTags('Admin - Route Points')
@ApiBearerAuth()
@Controller('admin')
export class RoutePointController {
  constructor(private readonly routePointService: RoutePointService) {}

  @Post('routes/:routeId/points')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a route point',
    description:
      'Adds a pickup or dropoff point to a specific route. Points can be ordered using the orderIndex field.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'Route UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: CreateRoutePointDto })
  @ApiResponse({
    status: 201,
    description: 'Route point created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Route not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async addRoutePoint(
    @Param() params: RouteIdParamDto,
    @Body() createRoutePointDto: CreateRoutePointDto,
  ) {
    return await this.routePointService.addRoutePoint(
      params.routeId,
      createRoutePointDto,
    );
  }

  @Patch('route-points/:id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a route point',
    description:
      'Updates information for a specific route point including name, address, coordinates, type, or order index.',
  })
  @ApiParam({
    name: 'id',
    description: 'Route Point UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateRoutePointDto })
  @ApiResponse({
    status: 200,
    description: 'Route point updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Route point not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async updateRoutePoint(
    @Param() params: RoutePointIdParamDto,
    @Body() updateRoutePointDto: UpdateRoutePointDto,
  ) {
    return await this.routePointService.updateRoutePoint(
      params.id,
      updateRoutePointDto,
    );
  }

  @Delete('route-points/:id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a route point',
    description:
      'Permanently deletes a route point. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    description: 'Route Point UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Route point deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Route point not found',
  })
  async deleteRoutePoint(@Param() params: RoutePointIdParamDto) {
    await this.routePointService.deleteRoutePoint(params.id);
  }
}
