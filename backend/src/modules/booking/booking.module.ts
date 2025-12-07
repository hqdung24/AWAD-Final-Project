import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatStatusModule } from '../seat-status/seat-status.module';
import { BookingController } from './booking.controller';
import { BookingRepository } from './booking.repository';
import { BookingService } from './booking.service';
import { Booking } from './entities/booking.entity';
import { BookingProvider } from './providers/booking.provider';
import { BookingEmailProvider } from './providers/booking-email.provider';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from '@/config/app.config';
@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    SeatStatusModule,
    ConfigModule.forFeature(appConfig),
  ],
  controllers: [BookingController],
  providers: [
    BookingService,
    BookingRepository,
    BookingProvider,
    BookingEmailProvider,
  ],
  exports: [
    BookingService,
    BookingRepository,
    BookingProvider,
    BookingEmailProvider,
  ],
})
export class BookingModule {}
