import { registerAs } from '@nestjs/config';

export const storageConfig = registerAs('storage', () => ({
  accountId: process.env.ACCOUNT_ID || '',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucketName: process.env.R2_BUCKET_NAME || '',
  endpoint: process.env.S3_ENDPOINT || '',
  publicUrlBase: process.env.PUBLIC_URL_BASE || '',
  mediaBasePath: process.env.R2_MEDIA_BASE_PATH || 'media',
}));
