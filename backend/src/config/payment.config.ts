import { registerAs } from '@nestjs/config';

export const payosConfig = registerAs('payos', () => ({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  baseUrl: process.env.PAYOS_BASE_URL || 'https://sandbox.payos.vn',
  returnUrl: process.env.BASE_FRONTEND_URL + 'upcoming-trip',
  cancelUrl: process.env.BASE_FRONTEND_URL + 'upcoming-trip?canceled=true',
  webhookUrl: process.env.PAYOS_WEBHOOK_URL,
}));
