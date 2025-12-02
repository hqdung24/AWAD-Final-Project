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
  ApiQuery,
} from '@nestjs/swagger';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripIdDto } from './dto/trip-id.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { SearchTripQueryDto } from './dto/search-trip-query.dto';
import { TripDetailParamDto } from './dto/trip-detail-param.dto';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';

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
  @Roles(RoleType.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of trips',
    description:
      'Retrieves a paginated list of trips with optional filters for route, bus, and status.',
  })
  @ApiQuery({ type: TripQueryDto })
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

// Public Trip Controller for users
@ApiTags('Trips - Public')
@Controller('trips')
@Auth(AuthType.None)
export class PublicTripController {
  constructor(private readonly tripService: TripService) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search for available trips',
    description:
      'Search and filter trips based on origin, destination, date, price, time slots, bus types, and amenities. ' +
      'Returns trips from the specified date onwards (not just on that exact date). ' +
      'Supports pagination and sorting. All filters are optional.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of trips matching search criteria',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              departureTime: { type: 'string', format: 'date-time' },
              arrivalTime: { type: 'string', format: 'date-time' },
              basePrice: { type: 'number' },
              status: { type: 'string' },
              availableSeatsCount: { type: 'number' },
              route: {
                type: 'object',
                properties: {
                  origin: { type: 'string' },
                  destination: { type: 'string' },
                  distance: { type: 'number' },
                  duration: { type: 'number' },
                },
              },
              bus: {
                type: 'object',
                properties: {
                  plateNumber: { type: 'string' },
                  model: { type: 'string' },
                  type: { type: 'string' },
                  capacity: { type: 'number' },
                  amenities: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async searchTrips(@Query() query: SearchTripQueryDto) {
    return await this.tripService.searchTrips(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get trip details',
    description:
      'Get detailed information about a specific trip including route, bus, and seat availability. ' +
      'Returns full seat status information for seat selection.',
  })
  @ApiParam({
    name: 'id',
    description: 'Trip UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Trip details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        departureTime: { type: 'string', format: 'date-time' },
        arrivalTime: { type: 'string', format: 'date-time' },
        basePrice: { type: 'number' },
        status: { type: 'string' },
        route: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            origin: { type: 'string' },
            destination: { type: 'string' },
            distance: { type: 'number' },
            duration: { type: 'number' },
          },
        },
        bus: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            plateNumber: { type: 'string' },
            model: { type: 'string' },
            type: { type: 'string' },
            capacity: { type: 'number' },
            amenities: { type: 'array', items: { type: 'string' } },
          },
        },
        seatStatuses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: {
                type: 'string',
                enum: ['available', 'booked', 'locked'],
              },
              seat: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  seatCode: { type: 'string' },
                  seatType: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Trip not found',
  })
  async getTripDetail(@Param() params: TripDetailParamDto) {
    return await this.tripService.getTripDetail(params.id);
  }
}
