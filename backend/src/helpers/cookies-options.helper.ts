import type { Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';

export const RT_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME ?? 'refreshToken';

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(RT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd, // 🔒 cần https trên production
    sameSite: isProd ? 'lax' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: process.env.REFRESH_COOKIE_PATH ?? '/auth',
    maxAge: Number(process.env.REFRESH_COOKIE_MAX_AGE ?? 2592000) * 1000, // ms
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(RT_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'lax' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: process.env.REFRESH_COOKIE_PATH ?? '/auth',
  });
}
