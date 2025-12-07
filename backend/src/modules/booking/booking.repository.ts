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
}
