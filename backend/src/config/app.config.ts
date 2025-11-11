import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '3600', 10),
  host: process.env.APP_HOST || 'localhost',
  environment: process.env.NODE_ENV || 'production',
  aws: {
    s3Bucket: process.env.S3_BUCKET || 'my-blauchat-bucket',
  },
  apiVersion: process.env.API_VERSION || '0.0.1',
  refreshCookie: {
    name: process.env.REFRESH_COOKIE_NAME || 'refreshToken',
    path: process.env.REFRESH_COOKIE_PATH || '/auth',
    maxAge: parseInt(process.env.REFRESH_COOKIE_MAX_AGE || '2592000', 10), // 30 days in seconds
  },
}));
