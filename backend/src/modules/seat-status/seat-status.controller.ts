import { Auth } from '@/modules/auth/decorator/auth.decorator';
import { AuthType } from '@/modules/auth/enums/auth-type.enum';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  LockSeatsErrorResponseDto,
  LockSeatsSuccessResponseDto,
} from './dto/lock-seats-response.dto';
import { LockSeatsDto } from './dto/lock-seats.dto';
import { SeatStatusService } from './seat-status.service';

@ApiTags('Seat Status')
@Controller('seat-status')
export class SeatStatusController {
  constructor(private readonly seatStatusService: SeatStatusService) {}

  @Post('lock')
  @Auth(AuthType.None) // Allow public access for now (can add passenger auth later)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lock seats for booking',
    description:
      'Lock seats for a specific trip to prevent double booking. ' +
      'Seats are locked for a configured duration (default 10 minutes). ' +
      'Returns a lock token that must be used for subsequent booking operations. ' +
      'If any seat cannot be locked, the entire operation fails with no partial locks.',
  })
  @ApiBody({
    type: LockSeatsDto,
    description: 'Trip ID and array of seat IDs to lock',
  })
  @ApiResponse({
    status: 200,
    description: 'Seats locked successfully',
    type: LockSeatsSuccessResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Trip not found',
    type: LockSeatsErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description:
      'Trip unavailable, seat locked by others, or seat already booked',
    type: LockSeatsErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid seat IDs or validation error',
    type: LockSeatsErrorResponseDto,
  })
  async lockSeats(@Body() lockSeatsDto: LockSeatsDto) {
    const result = await this.seatStatusService.lockSeats(
      lockSeatsDto.tripId,
      lockSeatsDto.seatIds,
    );

    return {
      success: true,
      trip_id: lockSeatsDto.tripId,
      seat_ids: result.seatIds,
      locked_until: result.lockedUntil,
      lock_token: result.lockToken,
    };
  }
}
