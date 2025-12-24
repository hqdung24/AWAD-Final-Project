import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassengerDetail } from './entities/passenger-detail.entity';

@Injectable()
export class PassengerDetailRepository {
  constructor(
    @InjectRepository(PassengerDetail)
    private readonly repository: Repository<PassengerDetail>,
  ) {}

  async findByTripId(tripId: string): Promise<PassengerDetail[]> {
    return this.repository
      .createQueryBuilder('passenger')
      .leftJoinAndSelect('passenger.booking', 'booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('trip.route', 'route')
      .where('booking.tripId = :tripId', { tripId })
      .orderBy('passenger.seatCode', 'ASC')
      .getMany();
  }

  async findByIdWithTrip(
    passengerId: string,
    tripId: string,
  ): Promise<PassengerDetail | null> {
    return this.repository
      .createQueryBuilder('passenger')
      .leftJoinAndSelect('passenger.booking', 'booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('trip.route', 'route')
      .where('passenger.id = :passengerId', { passengerId })
      .andWhere('booking.tripId = :tripId', { tripId })
      .getOne();
  }

  async updateCheckIn(passengerId: string, checkedInAt: Date | null) {
    await this.repository.update(passengerId, { checkedInAt });
    return this.repository.findOne({ where: { id: passengerId } });
  }
}
