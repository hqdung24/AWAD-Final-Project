import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { BookingProvider } from './providers/booking.provider';
import type { PassengerDto } from './dto/passenger.dto';
import type { ContactInfoDto } from './dto/contact-info.dto';
import type { BookingListQueryDto } from './dto';
import type { Booking } from './entities/booking.entity';

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

  async listBookings(
    query: BookingListQueryDto,
  ): Promise<{ data: Booking[]; total: number }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
    return await this.bookingRepository.findAllWithFilters(query);
  }

  async getBookingDetail(id: string): Promise<Booking> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
    const booking = await this.bookingRepository.findDetailById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return booking;
  }
}
