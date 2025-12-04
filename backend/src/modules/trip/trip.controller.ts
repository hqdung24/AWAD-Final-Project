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
import { SearchTripsDto } from './dto/search-trips.dto';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';
import { Auth } from '@/modules/auth/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/enums/auth-type.enum';

@ApiTags('Trips')
@Controller('trips')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Get('search')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search available trips (Public)',
    description:
      'Public endpoint to search for available trips based on origin, destination, date, and number of passengers. Returns trips with available seats.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trips found successfully',
    schema: {
      example: [
        {
          id: 'uuid',
          from: 'TP.HCM',
          to: 'Đà Lạt',
          departureTime: '2025-12-05T08:00:00Z',
          arrivalTime: '2025-12-05T14:30:00Z',
          duration: '6h 30m',
          price: 250000,
          busType: 'Sleeper',
          company: 'Phương Trang',
          amenities: ['wifi', 'air_conditioning', 'water'],
          seatsAvailable: 15,
          busModel: 'Thaco Universe',
          plateNumber: '51A-111.11',
        },
      ],
    },
  })
  async searchTrips(@Query() query: SearchTripsDto) {
    return await this.tripService.searchTrips(query);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get list of trips (Admin)',
    description:
      'Admin endpoint: Retrieves a paginated list of trips with optional filters for route, bus, and status.',
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
  async getTripsAdmin(@Query() query: TripQueryDto) {
    return await this.tripService.getTrips(query);
  }

  @Post('admin')
  @ApiBearerAuth()
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

  @Get('admin/:id')
  @ApiBearerAuth()
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

  @Patch('admin/:id')
  @ApiBearerAuth()
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

  @Patch('admin/:id/cancel')
  @ApiBearerAuth()
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
