import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  url: process.env.REDIS_URL,
  username: process.env.REDIS_USERNAME || '',
  password: process.env.REDIS_PASSWORD || '',
  tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined, // Enable TLS for rediss://
  ttl: parseInt(process.env.REDIS_TTL || '60', 10),
}));
