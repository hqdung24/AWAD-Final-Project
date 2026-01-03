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
import { bookingConfig } from '@/config/booking.config';
import { TicketTokenService } from './services/ticket-token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    SeatStatusModule,
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(bookingConfig),
  ],
  controllers: [BookingController],
  providers: [
    BookingService,
    BookingRepository,
    BookingProvider,
    BookingEmailProvider,
    TicketTokenService,
  ],
  exports: [
    BookingService,
    BookingRepository,
    BookingProvider,
    BookingEmailProvider,
    TicketTokenService,
  ],
})
export class BookingModule {}
