import { registerAs } from '@nestjs/config';

export const profileConfig = registerAs('profile', () => ({
  defaultAvatar:
    process.env.DEFAULT_AVATAR ||
    'https://blauchat-bucket.s3.amazonaws.com/defaults/default-avatar.png',
  defaultCoverImage:
    process.env.DEFAULT_COVER_IMAGE ||
    'https://blauchat-bucket.s3.amazonaws.com/defaults/default-cover-image.png',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
}));
