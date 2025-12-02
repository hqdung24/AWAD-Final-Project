import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRepository } from './booking.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository],
  exports: [BookingService, BookingRepository],
})
export class BookingModule {}
