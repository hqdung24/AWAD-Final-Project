import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
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
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripIdDto } from './dto/trip-id.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

@ApiTags('Admin - Trips')
@ApiBearerAuth()
@Controller('admin/trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new trip',
    description:
      'Creates a new trip with route, bus, time schedule, and base price. Automatically generates seat statuses for all seats in the bus.',
  })
  @ApiBody({ type: CreateTripDto })
  @ApiResponse({
    status: 201,
    description: 'Trip created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Route or Bus not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Bus scheduling conflict or inactive route/bus',
  })
  async createTrip(@Body() createTripDto: CreateTripDto) {
    return await this.tripService.createTrip(createTripDto);
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of trips',
    description:
      'Retrieves a paginated list of trips with optional filters for route, bus, and status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trips retrieved successfully',
    schema: {
      example: {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    },
  })
  async getTrips(@Query() query: TripQueryDto) {
    return await this.tripService.getTrips(query);
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get trip details',
    description:
      'Retrieves detailed information about a specific trip including route, bus, and seat statuses.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trip UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trip details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trip not found',
  })
  async getTripById(@Param() params: TripIdDto) {
    return await this.tripService.getTripById(params.id);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update trip information',
    description:
      'Updates trip details such as route, bus, schedule, price, or status. Validates bus scheduling conflicts if time or bus is changed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trip UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({ type: UpdateTripDto })
  @ApiResponse({
    status: 200,
    description: 'Trip updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trip not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Bus scheduling conflict',
  })
  async updateTrip(
    @Param() params: TripIdDto,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return await this.tripService.updateTrip(params.id, updateTripDto);
  }

  @Patch(':id/cancel')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel a trip',
    description:
      'Cancels a scheduled trip. Cannot cancel trips that are already completed or cancelled.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trip UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trip cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Trip not found or already cancelled/completed',
  })
  async cancelTrip(@Param() params: TripIdDto) {
    return await this.tripService.cancelTrip(params.id);
  }
}
