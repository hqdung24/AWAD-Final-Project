import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { BookingProvider } from './providers/booking.provider';
import type { PassengerDto } from './dto/passenger.dto';
import type { ContactInfoDto } from './dto/contact-info.dto';
import type { BookingListQueryDto } from './dto';
import type { Booking } from './entities/booking.entity';
import type { UpdateBookingDto } from './dto/update-booking.dto';

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
    return await this.bookingRepository.findAllWithFilters(query);
  }

  async getBookingDetail(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findDetailById(id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async updateBooking(id: string, dto: UpdateBookingDto): Promise<Booking> {
    try {
      const contact: { name?: string; email?: string; phone?: string } = {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      };

      return await this.bookingRepository.updateContactAndPassengers(
        id,
        contact,
        dto.passengers,
      );
    } catch (error: unknown) {
      const err = error as Error;

      if (err.message === 'BOOKING_NOT_FOUND') {
        throw new NotFoundException('Booking not found');
      }
      if (err.message?.startsWith('PASSENGER_NOT_FOUND_FOR_SEAT_')) {
        throw new BadRequestException('Seat code not found in this booking');
      }
      throw error;
    }
  }

  async cancelBooking(id: string): Promise<Booking> {
    try {
      return await this.bookingRepository.cancelBooking(id);
    } catch (error: unknown) {
      const err = error as Error;

      if (err.message === 'BOOKING_NOT_FOUND') {
        throw new NotFoundException('Booking not found');
      }
      if (err.message === 'CANNOT_CANCEL_NON_PENDING') {
        throw new BadRequestException('Only pending bookings can be cancelled');
      }

      throw error;
    }
  }
  async updateBookingStatus(
    id: string,
    status: string,
  ): Promise<Booking | null> {
    return await this.bookingRepository.update(id, { status: status });
  }

  async findBookingsForReminder(
    windowStart: Date,
    windowEnd: Date,
    reminderField: 'reminder24hSentAt' | 'reminder3hSentAt',
  ): Promise<Booking[]> {
    return this.bookingRepository.findBookingsForReminder(
      windowStart,
      windowEnd,
      reminderField,
    );
  }

  async markReminderSent(
    bookingId: string,
    reminderField: 'reminder24hSentAt' | 'reminder3hSentAt',
  ): Promise<boolean> {
    return this.bookingRepository.markReminderSent(bookingId, reminderField);
  }

  // For scheduled tasks
  async expirePendingBooking(): Promise<{ updated: number }> {
    // Update all bookings that are still 'pending' more than 12 hours old to 'expired'
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    // Fetch all pending bookings from db
    const pendingBookings =
      await this.bookingRepository.findPendingBookingsBefore(twelveHoursAgo);

    let updatedCount = 0;
    for (const booking of pendingBookings) {
      // Update booking status to expired
      await this.bookingRepository.update(booking.id, { status: 'expired' });
      updatedCount++;

      // Release seats associated with this expired booking
      await this.bookingRepository.releaseSeatsByBookingId(booking.id);
    }

    return { updated: updatedCount };
  }
}
