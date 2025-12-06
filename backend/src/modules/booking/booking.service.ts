import { Injectable } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { BookingProvider } from './providers/booking.provider';
import type { PassengerDto } from './dto/passenger.dto';
import type { ContactInfoDto } from './dto/contact-info.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly bookingProvider: BookingProvider,
  ) {}

  /**
   * Create a new booking with seat lock validation
   */
  async createBooking(
    lockToken: string,
    passengers: PassengerDto[],
    contactInfo: ContactInfoDto,
    paymentMethodId?: string,
    userId?: string,
  ) {
    return await this.bookingProvider.createBooking(
      lockToken,
      passengers,
      contactInfo,
      paymentMethodId,
      userId,
    );
  }
}
