import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorator/roles.decorator';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { RoleType } from '../auth/enums/roles-type.enum';
import { TripManagementService } from './trip-management.service';
import { CreateTripDto, UpdateTripDto } from './dtos/trip.dto';

@ApiTags('Trips')
@ApiBearerAuth('accessToken')
@Auth(AuthType.Bearer)
@Roles(RoleType.ADMIN)
@Controller('trips')
export class TripManagementController {
  constructor(private readonly tripService: TripManagementService) {}

  @Get()
  list() {
    return this.tripService.listTrips();
  }

  @Get('buses')
  listBuses() {
    return this.tripService.listBuses();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.tripService.getTrip(id);
  }

  @Post()
  create(@Body() dto: CreateTripDto) {
    return this.tripService.createTrip(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTripDto) {
    return this.tripService.updateTrip(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripService.deleteTrip(id);
  }
}
