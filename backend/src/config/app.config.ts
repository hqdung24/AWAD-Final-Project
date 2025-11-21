import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '3600', 10),
  host: process.env.APP_HOST || 'localhost',
  environment: process.env.NODE_ENV || 'production',
  apiVersion: process.env.API_VERSION || '0.0.1',
  refreshCookie: {
    name: process.env.REFRESH_COOKIE_NAME || 'refreshToken',
    path: process.env.REFRESH_COOKIE_PATH || '/auth',
    maxAge: parseInt(process.env.REFRESH_COOKIE_MAX_AGE || '2592000', 10), // 30 days in seconds
  },
  aws: {
    publicBucketName: process.env.AWS_PUBLIC_BUCKET_NAME || 'blauchat-bucket',
    region: process.env.AWS_REGION || 'ap-southeast-2',
    cloudfrontUrl:
      process.env.AWS_CLOUDFRONT_URL || 'd1a5tryaw1jowo.cloudfront.net',
    accessKey: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
}));
