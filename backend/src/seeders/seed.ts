import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';
import { Operator } from '@/modules/operator/entities/operator.entity';
import { Route } from '@/modules/route/entities/route.entity';
import { Bus } from '@/modules/bus/entities/bus.entity';
import { Seat } from '@/modules/seat/entities/seat.entity';
import { Trip } from '@/modules/trip/entities/trip.entity';
import { User } from '@/modules/users/entities/user.entity';
import { PaymentMethod } from '@/modules/payment-method/entities/payment-method.entity';
import { SeatStatus } from '@/modules/seat-status/entities/seat-status.entity';
import { Booking } from '@/modules/booking/entities/booking.entity';
import { PassengerDetail } from '@/modules/passenger-detail/entities/passenger-detail.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';
import { Notification } from '@/modules/notification/entities/notification.entity';
import { Feedback } from '@/modules/feedback/entities/feedback.entity';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { RoutePoint } from '@/modules/route/entities/route-point.entity';
// Load environment variables
const ENV = process.env.NODE_ENV;
const envFile = ENV ? `.env.${process.env.NODE_ENV}` : '.env';
config({ path: envFile });

// Create DataSource
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'bus_booking',
  entities: [
    User,
    PaymentMethod,
    Operator,
    Route,
    Bus,
    Seat,
    Trip,
    SeatStatus,
    Booking,
    PassengerDetail,
    Payment,
    Notification,
    Feedback,
    RoutePoint,
  ],
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
  ssl:
    ENV !== 'development' && ENV !== 'test'
      ? { rejectUnauthorized: false }
      : false,
});

interface OperatorRow {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
}

interface RouteRow {
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  operator_name: string;
}

interface RoutePointRow {
  route_origin: string;
  route_destination: string;
  type: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  order_index: string;
}

interface BusRow {
  plate_number: string;
  model: string;
  bus_type: string;
  capacity: string;
  operator_name: string;
  amenities: string;
}

interface SeatRow {
  bus_plate: string;
  seat_code: string;
  seat_type: string;
  floor: string;
}

interface TripRow {
  route_origin: string;
  route_destination: string;
  bus_plate: string;
  departure_time: string;
  arrival_time: string;
  base_price: string;
  status: string;
}

function readCSV<T>(filename: string): T[] {
  const filePath = path.join(__dirname, 'data', filename);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return (parse as unknown as (input: string, options?: any) => T[])(
    fileContent,
    {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    },
  );
}

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    /*
    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await AppDataSource.getRepository(Trip).clear();
    await AppDataSource.getRepository(Seat).clear();
    await AppDataSource.getRepository(Bus).clear();
    await AppDataSource.getRepository(Route).clear();
    await AppDataSource.getRepository(Operator).clear();
    console.log('✅ Existing data cleared'); */

    // 1. Seed Operators
    console.log('📦 Seeding operators...');
    const operatorRows = readCSV<OperatorRow>('operators.csv');
    const operatorMap = new Map<string, Operator>();

    for (const row of operatorRows) {
      const operator = new Operator();
      operator.name = row.name;
      operator.contactEmail = row.email;
      operator.contactPhone = row.phone;
      operator.status = 'active';
      operator.approvedAt = new Date();

      const savedOperator =
        await AppDataSource.getRepository(Operator).save(operator);
      operatorMap.set(row.name, savedOperator);
      console.log(`  ✓ Created operator: ${row.name}`);
    }

    // 2. Seed Routes
    console.log('📦 Seeding routes...');
    const routeRows = readCSV<RouteRow>('routes.csv');
    const routeMap = new Map<string, Route>();

    for (const row of routeRows) {
      const operator = operatorMap.get(row.operator_name);
      if (!operator) {
        console.warn(`  ⚠️  Operator not found: ${row.operator_name}`);
        continue;
      }

      const route = new Route();
      route.operatorId = operator.id;
      route.origin = row.origin;
      route.destination = row.destination;
      route.distanceKm = parseInt(row.distance);
      route.estimatedMinutes = parseFloat(row.duration) * 60;
      route.isActive = true;

      const savedRoute = await AppDataSource.getRepository(Route).save(route);
      routeMap.set(`${row.origin}-${row.destination}`, savedRoute);
      console.log(`  ✓ Created route: ${row.origin} → ${row.destination}`);
    }

    // 3. Seed Route Points
    console.log('📦 Seeding route points...');
    const routePointRows = readCSV<RoutePointRow>('route_points.csv');
    let routePointCount = 0;

    for (const row of routePointRows) {
      const route = routeMap.get(
        `${row.route_origin}-${row.route_destination}`,
      );
      if (!route) {
        console.warn(
          `  ⚠️  Route not found for route point: ${row.route_origin} → ${row.route_destination}`,
        );
        continue;
      }

      const routePoint = new RoutePoint();
      routePoint.routeId = route.id;
      routePoint.type = row.type;
      routePoint.name = row.name;
      routePoint.address = row.address;
      routePoint.orderIndex = parseInt(row.order_index, 10) || 0;
      const latitude = row.latitude ? Number(row.latitude) : null;
      const longitude = row.longitude ? Number(row.longitude) : null;
      routePoint.latitude = Number.isFinite(latitude) ? latitude : null;
      routePoint.longitude = Number.isFinite(longitude) ? longitude : null;

      await AppDataSource.getRepository(RoutePoint).save(routePoint);
      routePointCount++;
    }
    console.log(`  ✓ Created ${routePointCount} route points`);

    // 4. Seed Buses
    console.log('📦 Seeding buses...');
    const busRows = readCSV<BusRow>('buses.csv');
    const busMap = new Map<string, Bus>();

    for (const row of busRows) {
      const operator = operatorMap.get(row.operator_name);
      if (!operator) {
        console.warn(`  ⚠️  Operator not found: ${row.operator_name}`);
        continue;
      }

      const bus = new Bus();
      bus.operatorId = operator.id;
      bus.plateNumber = row.plate_number;
      bus.model = row.model;
      bus.busType = row.bus_type;
      bus.seatCapacity = parseInt(row.capacity);
      bus.amenitiesJson = row.amenities;
      bus.isActive = true;

      const savedBus = await AppDataSource.getRepository(Bus).save(bus);
      busMap.set(row.plate_number, savedBus);
      console.log(
        `  ✓ Created bus: ${row.plate_number} (${row.bus_type} - ${row.model})`,
      );
    }

    // 5. Seed Seats
    console.log('📦 Seeding seats...');
    const seatRows = readCSV<SeatRow>('seats.csv');
    let seatCount = 0;

    for (const row of seatRows) {
      const bus = busMap.get(row.bus_plate);
      if (!bus) {
        console.warn(`  ⚠️  Bus not found: ${row.bus_plate}`);
        continue;
      }

      const seat = new Seat();
      seat.busId = bus.id;
      seat.seatCode = row.seat_code;
      seat.seatType = row.seat_type;
      seat.isActive = true;

      await AppDataSource.getRepository(Seat).save(seat);
      seatCount++;
    }
    console.log(`  ✓ Created ${seatCount} seats`);

    // 6. Seed Trips
    console.log('📦 Seeding trips...');
    const tripRows = readCSV<TripRow>('trips.csv');
    const createdTrips: Trip[] = [];

    for (const row of tripRows) {
      const route = routeMap.get(
        `${row.route_origin}-${row.route_destination}`,
      );
      const bus = busMap.get(row.bus_plate);

      if (!route) {
        console.warn(
          `  ⚠️  Route not found: ${row.route_origin} → ${row.route_destination}`,
        );
        continue;
      }

      if (!bus) {
        console.warn(`  ⚠️  Bus not found: ${row.bus_plate}`);
        continue;
      }

      const trip = new Trip();
      trip.routeId = route.id;
      trip.busId = bus.id;
      trip.departureTime = new Date(row.departure_time);
      trip.arrivalTime = new Date(row.arrival_time);
      trip.basePrice = parseFloat(row.base_price);
      trip.status = row.status;

      const savedTrip = await AppDataSource.getRepository(Trip).save(trip);
      createdTrips.push(savedTrip);
      console.log(
        `  ✓ Created trip: ${row.route_origin} → ${row.route_destination} at ${row.departure_time}`,
      );
    }

    // 7. Generate Seat Statuses for all Trips
    // console.log('🪑 Generating seat statuses for trips...');
    // let seatStatusCount = 0;

    // for (const trip of createdTrips) {
    //   // Get all seats for this trip's bus
    //   const seats = await AppDataSource.getRepository(Seat).find({
    //     where: { busId: trip.busId },
    //   });

    //   for (const seat of seats) {
    //     const seatStatus = new SeatStatus();
    //     seatStatus.tripId = trip.id;
    //     seatStatus.seatId = seat.id;
    //     seatStatus.state = 'available';
    //     seatStatus.lockedUntil = new Date(0); // epoch time

    //     await AppDataSource.getRepository(SeatStatus).save(seatStatus);
    //     seatStatusCount++;
    //   }
    // }
    // console.log(`  ✓ Created ${seatStatusCount} seat statuses`);

    // 7. Generate Seat Statuses for all Trips (FAST VERSION)
    console.log('🪑 Generating seat statuses for trips...');
    let seatStatusCount = 0;

    const seatStatusRepo = AppDataSource.getRepository(SeatStatus);

    for (const trip of createdTrips) {
      const seats = await AppDataSource.getRepository(Seat).find({
        where: { busId: trip.busId },
        select: ['id'], // quan trọng: giảm payload
      });

      const seatStatuses = seats.map((seat) => {
        const ss = new SeatStatus();
        ss.tripId = trip.id;
        ss.seatId = seat.id;
        ss.state = 'available';
        ss.lockedUntil = new Date(0);
        return ss;
      });

      await seatStatusRepo.save(seatStatuses); // 🔥 1 query cho cả batch
      seatStatusCount += seatStatuses.length;
    }

    console.log(`  ✓ Created ${seatStatusCount} seat statuses`);

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Operators: ${operatorMap.size}`);
    console.log(`   - Routes: ${routeMap.size}`);
    console.log(`   - Route Points: ${routePointCount}`);
    console.log(`   - Buses: ${busMap.size}`);
    console.log(`   - Seats: ${seatCount}`);
    console.log(`   - Trips: ${tripRows.length}`);
    console.log(`   - Seat Statuses: ${seatStatusCount}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('👋 Database connection closed');
  }
}

void seed();
