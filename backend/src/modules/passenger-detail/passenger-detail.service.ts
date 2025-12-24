import { Injectable, NotFoundException } from '@nestjs/common';
import { PassengerDetailRepository } from './passenger-detail.repository';

@Injectable()
export class PassengerDetailService {
  constructor(
    private readonly passengerDetailRepository: PassengerDetailRepository,
  ) {}

  async listPassengersByTrip(tripId: string) {
    return this.passengerDetailRepository.findByTripId(tripId);
  }

  async checkInPassenger(tripId: string, passengerId: string) {
    const passenger = await this.passengerDetailRepository.findByIdWithTrip(
      passengerId,
      tripId,
    );
    if (!passenger) {
      throw new NotFoundException('Passenger not found for this trip');
    }

    if (passenger.checkedInAt) {
      return passenger;
    }

    await this.passengerDetailRepository.updateCheckIn(
      passengerId,
      new Date(),
    );

    return this.passengerDetailRepository.findByIdWithTrip(
      passengerId,
      tripId,
    );
  }

  async resetCheckIn(tripId: string, passengerId: string) {
    const passenger = await this.passengerDetailRepository.findByIdWithTrip(
      passengerId,
      tripId,
    );
    if (!passenger) {
      throw new NotFoundException('Passenger not found for this trip');
    }

    if (!passenger.checkedInAt) {
      return passenger;
    }

    await this.passengerDetailRepository.updateCheckIn(passengerId, null);

    return this.passengerDetailRepository.findByIdWithTrip(
      passengerId,
      tripId,
    );
  }
}
