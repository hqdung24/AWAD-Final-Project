import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingListQueryDto } from './dto';
import { SeatStatus } from '../seat-status/entities/seat-status.entity';
import { PassengerDetail } from '../passenger-detail/entities/passenger-detail.entity';
import { Seat } from '../seat/entities/seat.entity';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repository: Repository<Booking>,
  ) {}

  async findAllWithFilters(
    query: BookingListQueryDto,
  ): Promise<{ data: Booking[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      userId,
      email,
      phone,
      status,
      from,
      to,
    } = query;

    const qb = this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('route.routePoints', 'routePoints')
      .leftJoinAndSelect('booking.seatStatuses', 'seatStatus')
      .leftJoinAndSelect('seatStatus.seat', 'seat')
      .leftJoinAndSelect('booking.passengerDetails', 'passengerDetails')
      .distinct(true)
      .orderBy('booking.bookedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (userId) {
      qb.andWhere('booking.userId = :userId', { userId });
    }
    if (email) {
      qb.andWhere('booking.email = :email', { email });
    }
    if (phone) {
      qb.andWhere('booking.phone = :phone', { phone });
    }
    if (status) {
      qb.andWhere('booking.status = :status', { status });
    }
    if (from) {
      qb.andWhere('booking.bookedAt >= :from', {
        from: new Date(`${from}T00:00:00.000Z`),
      });
    }
    if (to) {
      qb.andWhere('booking.bookedAt <= :to', {
        to: new Date(`${to}T23:59:59.999Z`),
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findDetailById(id: string): Promise<Booking | null> {
    return await this.repository.findOne({
      where: { id },
      relations: [
        'trip',
        'trip.route',
        'trip.route.routePoints',
        'trip.bus',
        'user',
        'seatStatuses',
        'seatStatuses.seat',
        'passengerDetails',
      ],
    });
  }

  async updateContactAndPassengers(
    bookingId: string,
    contact: { name?: string; email?: string; phone?: string },
    passengers?: Array<{
      seatCode: string;
      fullName?: string;
      documentId?: string;
    }>,
  ): Promise<Booking> {
    return await this.repository.manager.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        relations: [
          'passengerDetails',
          'seatStatuses',
          'seatStatuses.seat',
          'trip',
          'trip.route',
        ],
      });

      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      // Apply contact updates if provided
      if (contact) {
        if (contact.name !== undefined) booking.name = contact.name;
        if (contact.email !== undefined) booking.email = contact.email;
        if (contact.phone !== undefined) booking.phone = contact.phone;
      }

      // Apply passenger updates keyed by seatCode
      if (passengers && passengers.length > 0) {
        const passengerBySeat = new Map(
          booking.passengerDetails.map((p) => [p.seatCode, p]),
        );

        for (const patch of passengers) {
          const target = passengerBySeat.get(patch.seatCode);
          if (!target) {
            throw new Error(`PASSENGER_NOT_FOUND_FOR_SEAT_${patch.seatCode}`);
          }
          if (patch.fullName !== undefined) target.fullName = patch.fullName;
          if (patch.documentId !== undefined)
            target.documentId = patch.documentId;
        }

        await manager.save(booking.passengerDetails);
      }

      await manager.save(booking);

      // Return fresh booking with relations
      return await manager.findOneOrFail(Booking, {
        where: { id: bookingId },
        relations: [
          'trip',
          'trip.route',
          'trip.route.routePoints',
          'seatStatuses',
          'seatStatuses.seat',
          'passengerDetails',
        ],
      });
    });
  }

  async update(
    id: string,
    updateData: Partial<Booking>,
  ): Promise<Booking | null> {
    //only allow update certain fields: passengerDetails, phone and email
    await this.repository.update(id, updateData);
    return this.repository.findOne({ where: { id } });
  }

  async updateBookingStatus(
    bookingId: string,
    status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'reviewed',
  ): Promise<Booking | null> {
    await this.repository.update(bookingId, { status });
    return this.repository.findOne({ where: { id: bookingId } });
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    return await this.repository.manager.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        relations: ['seatStatuses'],
      });

      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      if (booking.status !== 'pending') {
        throw new Error('CANNOT_CANCEL_NON_PENDING');
      }

      booking.status = 'cancelled';
      await manager.save(booking);

      // Release seats: make them available, drop booking link and lock
      await manager
        .createQueryBuilder()
        .update('seat_statuses')
        .set({
          state: 'available',
          bookingId: null,
          lockedUntil: null,
        })
        .where('bookingId = :bookingId', { bookingId })
        .execute();

      // return fresh booking with relations
      return await manager.findOneOrFail(Booking, {
        where: { id: bookingId },
        relations: [
          'trip',
          'trip.route',
          'trip.route.routePoints',
          'seatStatuses',
          'seatStatuses.seat',
          'passengerDetails',
        ],
      });
    });
  }

  async cancelBookingsByTripIds(tripIds: string[]): Promise<Booking[]> {
    if (tripIds.length === 0) return [];
    return this.repository.manager.transaction(async (manager) => {
      const bookings = await manager.find(Booking, {
        where: {
          tripId: In(tripIds),
          status: In(['pending', 'paid']),
        },
        relations: [
          'user',
          'trip',
          'trip.route',
          'seatStatuses',
          'seatStatuses.seat',
          'passengerDetails',
        ],
      });

      for (const booking of bookings) {
        booking.status = 'cancelled';
        await manager.save(booking);

        await manager
          .createQueryBuilder()
          .update('seat_statuses')
          .set({
            state: 'available',
            bookingId: null,
            lockedUntil: null,
          })
          .where('bookingId = :bookingId', { bookingId: booking.id })
          .execute();
      }

      if (bookings.length === 0) return [];
      return manager.find(Booking, {
        where: { id: In(bookings.map((b) => b.id)) },
        relations: [
          'user',
          'trip',
          'trip.route',
          'seatStatuses',
          'seatStatuses.seat',
          'passengerDetails',
        ],
      });
    });
  }

  async findPendingBookingsBefore(date: Date): Promise<Booking[]> {
    return await this.repository
      .find({
        where: {
          status: 'pending',
        },
        relations: ['seatStatuses'],
      })
      .then((bookings) => bookings.filter((b) => b.bookedAt < date));
  }

  async releaseSeatsByBookingId(bookingId: string): Promise<void> {
    await this.repository.manager
      .createQueryBuilder()
      .update('seat_statuses')
      .set({
        state: 'available',
        bookingId: null,
        lockedUntil: null,
      })
      .where('bookingId = :bookingId', { bookingId })
      .execute();
  }

  async findBookingsForReminder(
    windowStart: Date,
    windowEnd: Date,
    reminderField: 'reminder24hSentAt' | 'reminder3hSentAt',
  ): Promise<Booking[]> {
    const qb = this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('booking.passengerDetails', 'passengerDetails')
      .leftJoinAndSelect('booking.seatStatuses', 'seatStatus')
      .leftJoinAndSelect('seatStatus.seat', 'seat')
      .leftJoinAndSelect('booking.user', 'user')
      .where('booking.status IN (:...statuses)', { statuses: ['paid'] })
      .andWhere('trip.status = :tripStatus', { tripStatus: 'scheduled' })
      .andWhere('trip.departureTime BETWEEN :start AND :end', {
        start: windowStart,
        end: windowEnd,
      })
      .andWhere(`booking.${reminderField} IS NULL`);

    return qb.getMany();
  }

  reminderColumnMap = {
    reminder24hSentAt: 'reminder24h_sent_at',
    reminder3hSentAt: 'reminder3h_sent_at',
  } as const;

  async markReminderSent(
    bookingId: string,
    reminderField: 'reminder24hSentAt' | 'reminder3hSentAt',
  ): Promise<boolean> {
    const reminderColumn = this.reminderColumnMap[reminderField];
    const result = await this.repository
      .createQueryBuilder()
      .update(Booking)
      .set({ [reminderField]: () => 'CURRENT_TIMESTAMP' })
      .where('id = :bookingId', { bookingId })
      .andWhere(`"${reminderColumn}" IS NULL`)
      .execute();

    return (result.affected ?? 0) > 0;
  }

  async swapSeats(
    bookingId: string,
    seatChanges: Array<{ currentSeatId: string; newSeatId: string }>,
  ): Promise<Booking> {
    return this.repository.manager.transaction(async (manager) => {
      const booking = await manager.findOne(Booking, {
        where: { id: bookingId },
        relations: [
          'trip',
          'trip.route',
          'seatStatuses',
          'seatStatuses.seat',
          'passengerDetails',
        ],
      });

      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      const currentSeatIds = new Set(
        booking.seatStatuses.map((ss) => ss.seatId),
      );

      const targetSeatIds = new Set<string>();
      for (const change of seatChanges) {
        if (!currentSeatIds.has(change.currentSeatId)) {
          throw new Error('SEAT_NOT_IN_BOOKING');
        }
        if (change.currentSeatId === change.newSeatId) continue;
        if (targetSeatIds.has(change.newSeatId)) {
          throw new Error('TARGET_SEAT_DUPLICATE');
        }
        targetSeatIds.add(change.newSeatId);
      }

      if (targetSeatIds.size === 0) {
        return booking;
      }

      const targetSeatStatusList = await manager
        .createQueryBuilder(SeatStatus, 'ss')
        .setLock('pessimistic_write')
        .where('ss.tripId = :tripId', { tripId: booking.tripId })
        .andWhere('ss.seatId IN (:...targetSeatIds)', {
          targetSeatIds: Array.from(targetSeatIds),
        })
        .getMany();

      if (targetSeatStatusList.length !== targetSeatIds.size) {
        throw new Error('TARGET_SEAT_NOT_FOUND');
      }

      for (const target of targetSeatStatusList) {
        if (target.state !== 'available') {
          const err: any = new Error('TARGET_SEAT_UNAVAILABLE');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          err.seat = target.seatId;
          throw err;
        }
      }

      // Release current seats involved in change
      const currentSeatIdsToRelease = seatChanges.map((c) => c.currentSeatId);
      const seats = await manager.find(Seat, {
        where: { id: In([...targetSeatIds, ...currentSeatIdsToRelease]) },
      });
      const seatCodeMap = new Map<string, string>();
      seats.forEach((s) => seatCodeMap.set(s.id, s.seatCode));
      await manager
        .createQueryBuilder()
        .update(SeatStatus)
        .set({
          state: 'available',
          bookingId: null,
          lockedUntil: null,
        })
        .where('tripId = :tripId', { tripId: booking.tripId })
        .andWhere('seatId IN (:...seatIds)', {
          seatIds: currentSeatIdsToRelease,
        })
        .execute();

      // Assign new seats
      await manager
        .createQueryBuilder()
        .update(SeatStatus)
        .set({
          state: 'booked',
          bookingId: booking.id,
          lockedUntil: null,
        })
        .where('tripId = :tripId', { tripId: booking.tripId })
        .andWhere('seatId IN (:...seatIds)', {
          seatIds: Array.from(targetSeatIds),
        })
        .execute();

      // Update passenger seat codes based on mapping
      const newSeatMap = new Map<string, SeatStatus>();
      targetSeatStatusList.forEach((ss) => newSeatMap.set(ss.seatId, ss));

      const currentSeatStatusMap = new Map<string, SeatStatus>();
      booking.seatStatuses.forEach((ss) =>
        currentSeatStatusMap.set(ss.seatId, ss),
      );

      for (const change of seatChanges) {
        if (change.currentSeatId === change.newSeatId) continue;
        const oldSeatCode =
          currentSeatStatusMap.get(change.currentSeatId)?.seat?.seatCode ||
          seatCodeMap.get(change.currentSeatId);
        const passenger = booking.passengerDetails.find(
          (p) => p.seatCode === oldSeatCode,
        );
        const newSeatStatus = newSeatMap.get(change.newSeatId);
        const newSeatCode =
          newSeatStatus?.seat?.seatCode ||
          seatCodeMap.get(change.newSeatId) ||
          null;
        if (passenger && newSeatCode) {
          passenger.seatCode = newSeatCode;
        }
      }

      await manager.save(PassengerDetail, booking.passengerDetails);

      return await manager.findOneOrFail(Booking, {
        where: { id: booking.id },
        relations: [
          'trip',
          'trip.route',
          'trip.route.routePoints',
          'seatStatuses',
          'seatStatuses.seat',
          'passengerDetails',
        ],
      });
    });
  }

  async updateTicketToken(
    bookingId: string,
    rawToken: string,
    issuedAt: Date,
  ): Promise<void> {
    await this.repository.update(
      { id: bookingId },
      {
        ticketToken: rawToken,
        ticketTokenIssuedAt: issuedAt,
      },
    );
  }
}
