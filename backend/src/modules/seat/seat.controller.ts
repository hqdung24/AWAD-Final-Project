import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { Delete, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SeatService } from './seat.service';
import { BusIdParamDto } from './dto/bus-id-param.dto';
import { SeatIdParamDto } from './dto/seat-id-param.dto';
import { CreateSeatDto } from './dto/create-seat.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';
import { GenerateSeatsDto } from './dto/generate-seats.dto';
import { SeatType } from './enums/seat-type.enum';
import { Roles } from '@/modules/auth/decorator/roles.decorator';
import { RoleType } from '@/modules/auth/enums/roles-type.enum';

@ApiTags('Admin - Seats')
@Controller('admin')
@ApiBearerAuth()
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get('buses/:id/seats')
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  @ApiOperation({
    summary: 'Get all seats for a bus',
    description:
      'Retrieve all seats for a specific bus. Accessible by admins and moderators.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of seats retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Bus not found or inactive',
  })
  async getSeatsByBus(@Param() params: BusIdParamDto) {
    return await this.seatService.getSeatsByBusId(params.id);
  }

  @Post('buses/:id/seats')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Create a new seat for a bus',
    description:
      'Create a new seat for a specific bus. Accessible only by admins.',
  })
  @ApiResponse({
    status: 201,
    description: 'Seat created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Bus not found or inactive',
  })
  async createSeat(
    @Param() params: BusIdParamDto,
    @Body() createSeatDto: CreateSeatDto,
  ) {
    return await this.seatService.createSeat(params.id, createSeatDto);
  }

  @Post('buses/:id/seats/generate')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate seats for a bus' })
  async generateSeats(
    @Param() params: BusIdParamDto,
    @Body() dto: GenerateSeatsDto,
  ) {
    const capacity = dto.capacity ?? 0;
    const columns = dto.columns ?? 4;
    const seatType = dto.seatType ?? SeatType.STANDARD;
    return await this.seatService.generateSeats(params.id, {
      capacity,
      columns,
      seatType,
      replaceExisting: dto.replaceExisting ?? true,
    });
  }

  @Patch('buses/:busId/seats/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({
    summary: 'Update seat information',
    description:
      'Update details of a specific seat. Accessible only by admins.',
  })
  @ApiResponse({
    status: 200,
    description: 'Seat updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Seat not found or inactive',
  })
  async updateSeat(
    @Param('id') id: string,
    @Body() updateSeatDto: UpdateSeatDto,
  ) {
    return await this.seatService.updateSeat(id, updateSeatDto);
  }

  @Delete('seats/:id')
  @Roles(RoleType.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete seat (soft delete)',
    description: 'Mark a seat as inactive for a specific bus.',
  })
  @ApiResponse({
    status: 204,
    description: 'Seat deleted (soft) successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Seat not found or already inactive',
  })
  async deleteSeat(@Param() params: SeatIdParamDto) {
    await this.seatService.softDelete(params.id);
  }
}
