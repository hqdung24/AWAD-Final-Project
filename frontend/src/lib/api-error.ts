/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api-error.ts
import type { AxiosError } from 'axios';

export type ApiErrorPayload = {
  status: number;
  code: string;
  message: string;
  timestamp: string;
};

function isApiErrorPayload(x: unknown): x is ApiErrorPayload {
  return (
    !!x &&
    typeof x === 'object' &&
    typeof (x as any).message === 'string' &&
    typeof (x as any).status === 'number' &&
    typeof (x as any).code === 'string'
  );
}

/** Trả về message đã chuẩn hoá để hiển thị ra UI */
export function extractApiError(err: unknown): {
  message: string;
  status?: number;
  code?: string;
} {
  // Trường hợp AxiosError có response
  const ax = err as AxiosError;
  const data = ax?.response?.data;

  if (isApiErrorPayload(data)) {
    return { message: data.message, status: data.status, code: data.code };
  }

  // Một số backend đặt message ở data.message nhưng thiếu status/code
  if (data && typeof (data as any).message === 'string') {
    return { message: (data as any).message };
  }

  // Fallback cho network error / CORS / lỗi không xác định
  if (ax?.message) return { message: ax.message };

  return { message: 'Something went wrong. Please try again.' };
}
