import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { jwtConfig } from '@/config/jwt.config';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { SeatStatus } from '../entities/seat-status.entity';
import { SeatStatusRepository } from '../seat-status.repository';
import { Trip } from '@/modules/trip/entities/trip.entity';

export interface LockTokenPayload {
  tripId: string;
  seatIds: string[];
  lockedUntil: number;
  iat: number;
}

@Injectable()
export class SeatLockProvider {
  private readonly lockDuration: number; // in seconds

  constructor(
    private readonly dataSource: DataSource,
    private readonly seatStatusRepository: SeatStatusRepository,
    private readonly jwtService: JwtService,
    //inject jwt config
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {
    // Default 10 minutes, can be configured via SEAT_LOCK_DURATION env
    this.lockDuration = parseInt(process.env.SEAT_LOCK_DURATION || '600', 10);
  }

  /**
   * Lock seats for a trip with transaction to prevent race conditions
   * Uses pessimistic locking (FOR UPDATE) to ensure atomicity
   */
  async lockSeatsForTrip(
    tripId: string,
    seatIds: string[],
  ): Promise<{
    seatIds: string[];
    lockedUntil: string;
    lockToken: string;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validate trip exists and is available
      const trip = await queryRunner.manager.findOne(Trip, {
        where: { id: tripId },
        relations: ['bus', 'bus.operator'],
      });

      if (!trip) {
        throw new NotFoundException('Trip not found');
      }

      // Check trip status is scheduled
      if (trip.status !== 'scheduled') {
        throw new ConflictException(
          'Trip is cancelled or no longer available.',
        );
      }

      // Check if trip is in future
      if (new Date(trip.departureTime) <= new Date()) {
        throw new ConflictException('Trip departure time has passed.');
      }

      // Check operator is active
      if (!trip.bus.operator || trip.bus.operator.status !== 'active') {
        throw new ConflictException('Operator is not active.');
      }

      // Check bus is active
      if (!trip.bus.isActive) {
        throw new ConflictException('Bus is not active.');
      }

      // 2. Validate and lock all seats atomically with FOR UPDATE lock
      const now = new Date();
      const lockedUntilTime = new Date(
        now.getTime() + this.lockDuration * 1000,
      );

      // Fetch all seat statuses with FOR UPDATE lock
      const seatStatuses = await queryRunner.manager
        .createQueryBuilder(SeatStatus, 'seatStatus')
        .where('seatStatus.tripId = :tripId', { tripId })
        .andWhere('seatStatus.seatId IN (:...seatIds)', { seatIds })
        .setLock('pessimistic_write')
        // .leftJoinAndSelect('seatStatus.seat', 'seat') // dont left join seat to optimize
        .getMany();

      if (seatStatuses.length !== seatIds.length) {
        // Some seats don't have seat_status records
        const foundSeatIds = new Set(seatStatuses.map((ss) => ss.seatId));
        const missingSeats = seatIds.filter((id) => !foundSeatIds.has(id));

        throw new BadRequestException(
          `Seat status not found for seats: ${missingSeats.join(', ')}`,
        );
      }

      // 3. Validate each seat's availability
      const lockedByOthers: Array<{ seatId: string; lockedUntil: string }> = [];
      const bookedSeats: string[] = [];

      for (const seatStatus of seatStatuses) {
        if (seatStatus.state === 'booked') {
          bookedSeats.push(seatStatus.seatId);
        } else if (seatStatus.state === 'locked') {
          // Check if lock is expired
          if (
            seatStatus.lockedUntil &&
            new Date(seatStatus.lockedUntil) > now
          ) {
            lockedByOthers.push({
              seatId: seatStatus.seatId,
              lockedUntil: new Date(seatStatus.lockedUntil).toISOString(),
            });
          }
        }
      }

      // If any seat has an issue, reject ALL (no partial lock)
      if (bookedSeats.length > 0) {
        throw new ConflictException(
          `Seats already booked: ${bookedSeats.join(', ')}`,
        );
      }

      if (lockedByOthers.length > 0) {
        const firstLocked = lockedByOthers[0];
        const error: any = new ConflictException(
          'Seat is locked by another user',
        );
        // Attach custom properties to error response
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.seat = firstLocked.seatId;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.lockedUntil = firstLocked.lockedUntil;
        throw error;
      }

      // 4. Update all seats to locked state
      await queryRunner.manager
        .createQueryBuilder()
        .update(SeatStatus)
        .set({
          state: 'locked',
          lockedUntil: lockedUntilTime,
        })
        .where('tripId = :tripId', { tripId })
        .andWhere('seatId IN (:...seatIds)', { seatIds })
        .execute();

      await queryRunner.commitTransaction();
      console.log('lock info: ', lockedUntilTime);
      // 5. Generate lock token (JWT)
      const lockToken = this.generateLockToken(
        tripId,
        seatIds,
        lockedUntilTime,
      );
      console.log('lock token', lockToken);

      return {
        seatIds,
        lockedUntil: lockedUntilTime.toISOString(),
        lockToken,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Verify and decode lock token
   */
  verifyLockToken(token: string): LockTokenPayload {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = this.jwtService.verify(token, {
        secret: this.jwtConfiguration.secret,
      });
      return payload as LockTokenPayload;
    } catch {
      throw new BadRequestException('Invalid or expired lock token');
    }
  }

  /**
   * Generate JWT token for seat lock
   * Token includes tripId, seatIds, and lock expiration
   */
  private generateLockToken(
    tripId: string,
    seatIds: string[],
    lockedUntil: Date,
  ): string {
    const now = new Date();
    const lockedUntilTimestamp = lockedUntil.getTime();

    const payload: LockTokenPayload = {
      tripId,
      seatIds,
      lockedUntil: lockedUntilTimestamp,
      iat: Math.floor(now.getTime() / 1000),
    };

    try {
      const token = this.jwtService.sign(payload, {
        secret: this.jwtConfiguration.secret,
        expiresIn: this.lockDuration,
      });

      console.log('TOKEN:', token);
      return token;
    } catch (err) {
      console.error('JWT SIGN ERROR:', err);
      throw err;
    }
  }

  /**
   * Unlock seats (used when booking is cancelled or lock expires)
   */
  async unlockSeats(tripId: string, seatIds: string[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update seats to available state
      await queryRunner.manager.update(
        SeatStatus,
        {
          tripId,
          seatId: seatIds,
          state: 'locked',
        },
        {
          state: 'available',
          lockedUntil: undefined,
        },
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get lock duration in seconds
   */
  getLockDuration(): number {
    return this.lockDuration;
  }
}
