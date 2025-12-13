import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { BookingListQueryDto } from './dto';

@Injectable()
export class BookingRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repository: Repository<Booking>,
  ) {}

  async findAllWithFilters(
    query: BookingListQueryDto,
  ): Promise<{ data: Booking[]; total: number }> {
    const { page = 1, limit = 10, userId, email, phone } = query;

    const qb = this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('booking.seatStatuses', 'seatStatus')
      .leftJoinAndSelect('seatStatus.seat', 'seat')
      .leftJoinAndSelect('booking.passengerDetails', 'passengerDetails')
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

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findDetailById(id: string): Promise<Booking | null> {
    return await this.repository.findOne({
      where: { id },
      relations: [
        'trip',
        'trip.route',
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
}
