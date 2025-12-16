import { registerAs } from '@nestjs/config';

export const bookingConfig = registerAs('booking', () => ({
  editCutoffHours: parseInt(process.env.BOOKING_EDIT_CUTOFF_HOURS || '3', 10),
}));
