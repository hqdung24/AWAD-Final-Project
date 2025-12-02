import { Injectable } from '@nestjs/common';

import { SearchTripQueryDto, TripSortBy } from '../dto/search-trip-query.dto';
import { Trip } from '../entities/trip.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TripSearchProvider {
  constructor(
    @InjectRepository(Trip)
    private readonly repository: Repository<Trip>,
  ) {}

  async searchTrips(
    query: SearchTripQueryDto,
  ): Promise<{ trips: Trip[]; total: number; page: number; limit: number }> {
    const qb = this.repository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.bus', 'bus')
      .leftJoinAndSelect('trip.seatStatuses', 'seatStatuses')
      .where('trip.status != :cancelledStatus', {
        cancelledStatus: 'cancelled',
      });

    // Filter by origin
    if (query.origin) {
      qb.andWhere('route.origin = :origin', { origin: query.origin });
    }

    // Filter by destination
    if (query.destination) {
      qb.andWhere('route.destination = :destination', {
        destination: query.destination,
      });
    }

    // Filter by date (from this date onwards)
    if (query.date) {
      const startDate = new Date(query.date);
      startDate.setHours(0, 0, 0, 0);
      qb.andWhere('trip.departureTime >= :startDate', { startDate });
    }

    // // Filter by price range
    // if (query.minPrice !== undefined) {
    //   qb.andWhere('trip.basePrice >= :minPrice', { minPrice: query.minPrice });
    // }
    // if (query.maxPrice !== undefined) {
    //   qb.andWhere('trip.basePrice <= :maxPrice', { maxPrice: query.maxPrice });
    // }

    // // Filter by time slots
    // if (query.timeSlots && query.timeSlots.length > 0) {
    //   const timeConditions = query.timeSlots.map((slot) => {
    //     switch (slot) {
    //       case TimeSlot.MORNING:
    //         return 'EXTRACT(HOUR FROM trip.departureTime) >= 6 AND EXTRACT(HOUR FROM trip.departureTime) < 12';
    //       case TimeSlot.AFTERNOON:
    //         return 'EXTRACT(HOUR FROM trip.departureTime) >= 12 AND EXTRACT(HOUR FROM trip.departureTime) < 18';
    //       case TimeSlot.EVENING:
    //         return 'EXTRACT(HOUR FROM trip.departureTime) >= 18 AND EXTRACT(HOUR FROM trip.departureTime) < 24';
    //       case TimeSlot.NIGHT:
    //         return 'EXTRACT(HOUR FROM trip.departureTime) >= 0 AND EXTRACT(HOUR FROM trip.departureTime) < 6';
    //       default:
    //         return '1=1';
    //     }
    //   });
    //   qb.andWhere(`(${timeConditions.join(' OR ')})`);
    // }

    // // Filter by bus types
    // if (query.busTypes && query.busTypes.length > 0) {
    //   qb.andWhere('bus.type IN (:...busTypes)', { busTypes: query.busTypes });
    // }

    // // Filter by amenities (trip must have ALL specified amenities)
    // if (query.amenities && query.amenities.length > 0) {
    //   for (const amenity of query.amenities) {
    //     qb.andWhere(`bus.amenities @> :amenity${amenity}`, {
    //       [`amenity${amenity}`]: JSON.stringify([amenity]),
    //     });
    //   }
    // }

    // // Filter by available seats (if passengers specified)

    // if (query.passengers && query.passengers > 0) {
    //   qb.andWhere((qb) => {
    //     const subQuery = qb
    //       .subQuery()
    //       .select('COUNT(*)')
    //       .from('seat_statuses', 'ss')
    //       .where('ss.tripId = trip.id')
    //       .andWhere('ss.state = :availableStatus', {
    //         availableStatus: 'available',
    //       })
    //       .getQuery();
    //     return `(${subQuery}) >= :passengers`;
    //   });
    //   qb.setParameter('passengers', query.passengers);
    // }

    // Get total count before pagination

    const total = await qb.getCount();

    // Apply sorting
    switch (query.sortBy) {
      case TripSortBy.PRICE_ASC:
        qb.orderBy('trip.basePrice', 'ASC');
        break;
      case TripSortBy.PRICE_DESC:
        qb.orderBy('trip.basePrice', 'DESC');
        break;
      case TripSortBy.TIME_ASC:
        qb.orderBy('trip.departureTime', 'ASC');
        break;
      case TripSortBy.TIME_DESC:
        qb.orderBy('trip.departureTime', 'DESC');
        break;
      case TripSortBy.DURATION_ASC:
        qb.orderBy('route.duration', 'ASC');
        break;
      case TripSortBy.DURATION_DESC:
        qb.orderBy('route.duration', 'DESC');
        break;
      default:
        qb.orderBy('trip.basePrice', 'ASC');
    }

    // Apply pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    qb.skip((page - 1) * limit).take(limit);

    const trips = await qb.getMany();

    return {
      trips,
      total,
      page,
      limit,
    };
  }

  async getTripDetail(id: string): Promise<Trip | null> {
    return await this.repository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.bus', 'bus')
      .leftJoinAndSelect('trip.seatStatuses', 'seatStatuses')
      .leftJoinAndSelect('seatStatuses.seat', 'seat')
      .where('trip.id = :id', { id })
      .getOne();
  }
}
