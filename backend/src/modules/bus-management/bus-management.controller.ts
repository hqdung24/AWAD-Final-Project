import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { Roles } from '../auth/decorator/roles.decorator';
import { RoleType } from '../auth/enums/roles-type.enum';
import { BusManagementService } from './bus-management.service';
import { BusAssignmentDto, CreateBusDto, UpdateBusDto } from './dtos/bus.dto';
import { SeatMapDto } from './dtos/seat-map.dto';

@ApiTags('Buses')
@ApiBearerAuth('accessToken')
@Auth(AuthType.Bearer)
@Roles(RoleType.ADMIN)
@Controller('buses')
export class BusManagementController {
  constructor(private readonly busService: BusManagementService) {}

  @Get()
  list() {
    return this.busService.listBuses();
  }

  @Post()
  create(@Body() dto: CreateBusDto) {
    return this.busService.createBus(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBusDto) {
    return this.busService.updateBus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.busService.deleteBus(id);
  }

  @Get('assignments/all')
  listAssignments(@Query('busId') busId?: string) {
    return this.busService.listAssignments(busId);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: BusAssignmentDto) {
    return this.busService.assignBus(id, dto);
  }

  @Delete('assignments/:id')
  deleteAssignment(@Param('id') id: string) {
    return this.busService.deleteAssignment(id);
  }

  @Get(':id/seat-map')
  getSeatMap(@Param('id') id: string) {
    return this.busService.getSeatMap(id);
  }

  @Patch(':id/seat-map')
  updateSeatMap(@Param('id') id: string, @Body() dto: SeatMapDto) {
    return this.busService.updateSeatMap(id, dto);
  }
}
