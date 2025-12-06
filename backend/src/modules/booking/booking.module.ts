import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatStatusModule } from '../seat-status/seat-status.module';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { BookingProvider } from './providers/booking.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), SeatStatusModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, BookingProvider],
  exports: [BookingService, BookingRepository, BookingProvider],
})
export class BookingModule {}
