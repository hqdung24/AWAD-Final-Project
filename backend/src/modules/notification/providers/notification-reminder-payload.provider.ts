import { Injectable } from '@nestjs/common';
import type { Booking } from '@/modules/booking/entities/booking.entity';

@Injectable()
export class NotificationReminderPayloadProvider {
  buildReminderPayload(booking: Booking, reminderType: '24h' | '3h') {
    const seats =
      booking.seatStatuses?.map((s) => s.seat?.seatCode).filter(Boolean) ?? [];

    const passengers =
      booking.passengerDetails?.map((p) => ({
        fullName: p.fullName,
        seatCode: p.seatCode,
        documentId: p.documentId,
      })) ?? [];

    const contact = {
      name:
        booking.name ||
        [booking.user?.firstName, booking.user?.lastName]
          .filter(Boolean)
          .join(' ') ||
        null,
      email: booking.email || booking.user?.email || null,
      phone: booking.phone || booking.user?.phone || null,
    };

    return {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      origin: booking.trip?.route?.origin || '—',
      destination: booking.trip?.route?.destination || '—',
      departureTime: booking.trip?.departureTime?.toISOString?.() || '',
      arrivalTime: booking.trip?.arrivalTime?.toISOString?.(),
      seats,
      passengers,
      contact,
      reminderType,
      manageBookingUrl: booking.id,
    };
  }
}
