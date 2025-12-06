import { PassengerDetail } from '@/modules/passenger-detail/entities/passenger-detail.entity';
import { SeatStatus } from '@/modules/seat-status/entities/seat-status.entity';
import type { LockTokenPayload } from '@/modules/seat-status/providers/seat-lock.provider';
import { Seat } from '@/modules/seat/entities/seat.entity';
import { Trip } from '@/modules/trip/entities/trip.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { ContactInfoDto } from '../dto/contact-info.dto';
import type { PassengerDto } from '../dto/passenger.dto';
import { Booking } from '../entities/booking.entity';
import { SeatStatusService } from '@/modules/seat-status/seat-status.service';

export interface CreateBookingResult {
  booking: Booking;
  seats: Array<{ seatId: string; seatCode: string }>;
  passengers: PassengerDetail[];
}

@Injectable()
export class BookingProvider {
  constructor(
    private readonly dataSource: DataSource,
    private readonly seatStatusService: SeatStatusService,
  ) {}

  /**
   * Verify and decode the lock token
   * Throws BadRequestException if token is invalid or expired
   */
  private verifyLockToken(lockToken: string): LockTokenPayload {
    try {
      const payload = this.seatStatusService.verifyLockToken(lockToken);

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.lockedUntil < now) {
        throw new BadRequestException('Lock token has expired');
      }

      return payload;
    } catch (error) {
      if ((error as Error).name === 'TokenExpiredError') {
        throw new BadRequestException('Lock token has expired');
      }
      if ((error as Error).name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid lock token');
      }
      throw error;
    }
  }

  /**
   * Validate passenger data against seat information
   */
  private validatePassengers(
    passengers: PassengerDto[],
    seatIds: string[],
    seats: Seat[],
  ): void {
    // Check passenger count matches seat count
    if (passengers.length !== seatIds.length) {
      throw new ConflictException(
        'Number of passengers must match number of seats',
      );
    }

    // Validate each passenger's seatCode matches the actual seat
    for (const passenger of passengers) {
      const matchingSeat = seats.find(
        (seat) => seat.seatCode === passenger.seatCode,
      );

      if (!matchingSeat) {
        throw new BadRequestException(
          `Passenger seatCode ${passenger.seatCode} does not match requested seat`,
        );
      }

      // Ensure the seat is in the locked seatIds
      if (!seatIds.includes(matchingSeat.id)) {
        throw new BadRequestException(
          `Seat ${passenger.seatCode} is not in the locked seats`,
        );
      }
    }

    // Ensure no duplicate seatCodes in passengers
    const seatCodes = passengers.map((p) => p.seatCode);
    const uniqueSeatCodes = new Set(seatCodes);
    if (seatCodes.length !== uniqueSeatCodes.size) {
      throw new BadRequestException('Duplicate seat codes in passengers list');
    }
  }

  /**
   * Validate seat statuses are still locked and available for booking
   */
  private validateSeatStatuses(seatStatuses: SeatStatus[]): void {
    const now = new Date();

    for (const seatStatus of seatStatuses) {
      // Check if seat is in locked state
      if (seatStatus.state !== 'locked') {
        const errorMessage =
          seatStatus.state === 'booked'
            ? 'Seat is already booked'
            : 'Seat is not locked';

        const error: any = new ConflictException(errorMessage);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.seat = seatStatus.seat?.seatCode || seatStatus.seatId;
        throw error;
      }

      // Check if lock has expired
      if (!seatStatus.lockedUntil || seatStatus.lockedUntil < now) {
        const error: any = new ConflictException('Seat lock has expired');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.seat = seatStatus.seat?.seatCode || seatStatus.seatId;
        throw error;
      }

      // Check seat is not already booked
      if (seatStatus.bookingId) {
        const error: any = new ConflictException('Seat is already booked');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.seat = seatStatus.seat?.seatCode || seatStatus.seatId;
        throw error;
      }
    }
  }

  /**
   * Calculate total amount based on trip price and number of seats
   */
  private calculateTotalAmount(trip: Trip, seatCount: number): number {
    return Number(trip.basePrice) * seatCount;
  }

  /**
   * Create a booking with all validations and atomic operations
   * Uses pessimistic locking to prevent race conditions
   */
  async createBooking(
    lockToken: string,
    passengers: PassengerDto[],
    contactInfo: ContactInfoDto, // not used yet, maybe for guest bookings later
    paymentMethodId?: string, // not used yet
    userId?: string,
  ): Promise<CreateBookingResult> {
    // 1. Verify lock token
    const tokenPayload = this.verifyLockToken(lockToken);
    const { tripId, seatIds } = tokenPayload;

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('REPEATABLE READ');

    try {
      // 2. Fetch trip information
      const trip = await queryRunner.manager.findOne(Trip, {
        where: { id: tripId },
        relations: ['route'],
      });

      if (!trip) {
        throw new NotFoundException('Trip not found');
      }

      // 3. Fetch seat statuses with pessimistic lock (FOR UPDATE)
      const seatStatuses = await queryRunner.manager
        .createQueryBuilder(SeatStatus, 'seatStatus')
        .where('seatStatus.tripId = :tripId', { tripId })
        .leftJoinAndSelect('seatStatus.seat', 'seat')
        .andWhere('seatStatus.seatId IN (:...seatIds)', { seatIds })
        .getMany();

      // 4. Validate all seats were found
      if (seatStatuses.length !== seatIds.length) {
        const foundSeatIds = seatStatuses.map((ss) => ss.seatId);
        const missingSeatIds = seatIds.filter(
          (id) => !foundSeatIds.includes(id),
        );
        throw new NotFoundException(
          `Seats not found: ${missingSeatIds.join(', ')}`,
        );
      }

      // 5. Fetch seat details
      const seats = seatStatuses.map((ss) => ss.seat).filter(Boolean);

      // 6. Validate passengers against seats
      this.validatePassengers(passengers, seatIds, seats);

      // 7. Validate seat statuses
      this.validateSeatStatuses(seatStatuses);

      // 8. Calculate total amount
      const totalAmount = this.calculateTotalAmount(trip, seatIds.length);

      // 9. Create booking
      const booking = queryRunner.manager.create(Booking, {
        userId: userId || null,
        tripId,
        status: 'pending',
        totalAmount,
      });

      const savedBooking = await queryRunner.manager.save(Booking, booking);

      // 10. Create passenger details
      const passengerDetails: PassengerDetail[] = [];
      for (const passengerDto of passengers) {
        const passengerDetail = queryRunner.manager.create(PassengerDetail, {
          bookingId: savedBooking.id,
          fullName: passengerDto.fullName,
          documentId: passengerDto.documentId,
          seatCode: passengerDto.seatCode,
          // Store phone in passenger detail if needed (add column first)
        });

        const savedPassenger = await queryRunner.manager.save(
          PassengerDetail,
          passengerDetail,
        );
        passengerDetails.push(savedPassenger);
      }

      // 11. Update seat statuses to booked
      await queryRunner.manager
        .createQueryBuilder()
        .update(SeatStatus)
        .set({
          state: 'booked',
          bookingId: savedBooking.id,
          lockedUntil: undefined,
        })
        .where('tripId = :tripId', { tripId })
        .andWhere('seatId IN (:...seatIds)', { seatIds })
        .execute();

      // 12. Commit transaction
      await queryRunner.commitTransaction();

      // 13. Return result
      return {
        booking: savedBooking,
        seats: seats.map((seat) => ({
          seatId: seat.id,
          seatCode: seat.seatCode,
        })),
        passengers: passengerDetails,
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
