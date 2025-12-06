import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';

@Injectable()
export class TripRepository {
  constructor(
    @InjectRepository(Trip)
    private readonly repository: Repository<Trip>,
  ) {}

  async create(tripData: Partial<Trip>): Promise<Trip> {
    const trip = this.repository.create(tripData);
    return await this.repository.save(trip);
  }

  async findById(id: string): Promise<Trip | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['route', 'bus', 'seatStatuses'],
    });
  }

  async findByIdWithRoutePoints(id: string): Promise<Trip | null> {
    return await this.repository.findOne({
      where: { id },
      relations: [
        'route',
        'route.routePoints',
        'route.operator',
        'bus',
        'bus.operator',
        'seatStatuses',
      ],
    });
  }

  async findAll(filters: {
    routeId?: string;
    busId?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<[Trip[], number]> {
    const { routeId, busId, status, page, limit } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.bus', 'bus')
      .skip(skip)
      .take(limit)
      .orderBy('trip.departureTime', 'DESC');

    if (routeId) {
      queryBuilder.andWhere('trip.routeId = :routeId', { routeId });
    }

    if (busId) {
      queryBuilder.andWhere('trip.busId = :busId', { busId });
    }

    if (status) {
      queryBuilder.andWhere('trip.status = :status', { status });
    }

    return await queryBuilder.getManyAndCount();
  }

  async update(id: string, updateData: Partial<Trip>): Promise<Trip | null> {
    await this.repository.update(id, updateData);
    return await this.findById(id);
  }

  async findBusConflicts(
    busId: string,
    departureTime: Date,
    arrivalTime: Date,
    excludeTripId?: string,
  ): Promise<Trip[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('trip')
      .where('trip.busId = :busId', { busId })
      .andWhere('trip.status != :status', { status: 'cancelled' })
      .andWhere(
        '(trip.departureTime < :arrivalTime AND trip.arrivalTime > :departureTime)',
        {
          departureTime,
          arrivalTime,
        },
      );

    if (excludeTripId) {
      queryBuilder.andWhere('trip.id != :excludeTripId', { excludeTripId });
    }

    return await queryBuilder.getMany();
  }

  async save(trip: Trip): Promise<Trip> {
    return await this.repository.save(trip);
  }

  async searchTrips(filters: {
    from?: string;
    to?: string;
    date?: string;
    passengers?: number;
  }): Promise<Trip[]> {
    const { from, to, date, passengers } = filters;

    console.log('🔍 Search filters received:', { from, to, date, passengers });

    const queryBuilder = this.repository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.route', 'route')
      .leftJoinAndSelect('trip.bus', 'bus')
      .leftJoinAndSelect('bus.operator', 'operator')
      .leftJoinAndSelect('trip.seatStatuses', 'seatStatus')
      .where('trip.status = :status', { status: 'scheduled' });

    // Filter by origin
    if (from) {
      queryBuilder.andWhere('route.origin ILIKE :from', { from: `%${from}%` });
    }

    // Filter by destination
    if (to) {
      queryBuilder.andWhere('route.destination ILIKE :to', { to: `%${to}%` });
    }

    // Filter by date (departure date)
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      queryBuilder.andWhere(
        'trip.departureTime >= :startOfDay AND trip.departureTime <= :endOfDay',
        { startOfDay, endOfDay },
      );
    }

    const sql = queryBuilder.getSql();
    console.log('📝 Generated SQL:', sql);
    console.log('📊 Query parameters:', queryBuilder.getParameters());

    const trips = await queryBuilder.getMany();
    console.log(`✅ Found ${trips.length} trips before seat filtering`);

    // Filter by available seats if passengers specified
    if (passengers) {
      const filtered = trips.filter((trip) => {
        const availableSeats =
          trip.seatStatuses?.filter((ss) => ss.state === 'available').length ||
          0;
        return availableSeats >= passengers;
      });
      console.log(`✅ After seat filtering: ${filtered.length} trips`);
      return filtered;
    }

    return trips;
  }
}
