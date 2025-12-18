import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { BookingRepository } from './booking.repository';
import { BookingProvider } from './providers/booking.provider';
import type { PassengerDto } from './dto/passenger.dto';
import type { ContactInfoDto } from './dto/contact-info.dto';
import type { BookingListQueryDto } from './dto';
import type { Booking } from './entities/booking.entity';
import type { UpdateBookingDto } from './dto/update-booking.dto';
import { bookingConfig } from '@/config/booking.config';
import { Inject } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import type { UpdateSeatsDto } from './dto/update-seats.dto';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly bookingProvider: BookingProvider,
    @Inject(bookingConfig.KEY)
    private readonly bookingConfiguration: ConfigType<typeof bookingConfig>,
  ) {}

  private ensureEditable(booking: Booking) {
    if (booking.status === 'expired' || booking.status === 'cancelled') {
      throw new BadRequestException(
        'Booking cannot be modified in this status',
      );
    }

    const cutoffHours = this.bookingConfiguration.editCutoffHours || 3;
    const cutoffTime =
      booking.trip?.departureTime &&
      new Date(
        booking.trip.departureTime.getTime() - cutoffHours * 60 * 60 * 1000,
      );

    if (cutoffTime && new Date() > cutoffTime) {
      throw new BadRequestException(
        `Booking can only be modified at least ${cutoffHours} hours before departure`,
      );
    }
  }

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
      const booking = await this.bookingRepository.findDetailById(id);
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      this.ensureEditable(booking);

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

  async changeSeats(bookingId: string, dto: UpdateSeatsDto): Promise<Booking> {
    try {
      const booking = await this.bookingRepository.findDetailById(bookingId);
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      this.ensureEditable(booking);

      return await this.bookingRepository.swapSeats(bookingId, dto.seatChanges);
    } catch (error: unknown) {
      const err = error as Error;

      if (err.message === 'BOOKING_NOT_FOUND') {
        throw new NotFoundException('Booking not found');
      }
      if (err.message === 'SEAT_NOT_IN_BOOKING') {
        throw new BadRequestException('One or more seats are not in booking');
      }
      if (err.message === 'TARGET_SEAT_NOT_FOUND') {
        throw new BadRequestException('Target seat not found in this trip');
      }
      if (err.message === 'TARGET_SEAT_UNAVAILABLE') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const seat = (err as any).seat as string | undefined;
        throw new BadRequestException(
          seat ? `Seat ${seat} is unavailable` : 'Target seat is unavailable',
        );
      }
      if (err.message === 'TARGET_SEAT_DUPLICATE') {
        throw new BadRequestException('Duplicate target seats provided');
      }

      this.logger.error(
        `Seat change failed for booking ${bookingId}: ${err.message}`,
        err.stack,
      );

      throw error;
    }
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
