import type { Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const RT_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME ?? 'refreshToken';

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(RT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd, // HTTPS required in production
    sameSite: isProd ? 'none' : 'lax', // 'none' for cross-origin
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/',
    maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE ?? 2592000) * 1000,
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(RT_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', // Must match setRefreshCookie
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/',
  });
}
