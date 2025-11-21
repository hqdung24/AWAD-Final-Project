/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/http.ts
import { RefreshResponseSchema } from '@/schemas/auth/refresh.response';
import { useAuthStore } from '@/stores/auth';
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios';
export const baseURL = import.meta.env.VITE_API_URL;

// axios chính
export const http: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true, // dùng cookie RT
  timeout: 15000,
  xsrfCookieName: 'csrf_token', // nếu BE bật CSRF
  xsrfHeaderName: 'x-csrf-token',
});

// axios riêng cho refresh
const refreshHttp: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  xsrfCookieName: 'csrf_token',
  xsrfHeaderName: 'x-csrf-token',
});

// attach AT
http.interceptors.request.use((config) => {
  const at = useAuthStore.getState().accessToken;
  if (at) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${at}`;
  }
  return config;
});

// 401 -> refresh -> retry
let isRefreshing = false;
let waiters: Array<(at: string) => void> = [];

http.interceptors.response.use(
  (res) => res.data,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = (original?.url || '').toLowerCase();

    if (!original || original._retry) return Promise.reject(error);

    const skip =
      url.includes('/auth/signin') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/signout') ||
      url.includes('/auth/refresh');

    if (status === 401 && !skip) {
      original._retry = true;
      console.log('Cookie sẵn sàng gửi: ', document.cookie); // Xem có cookie RT không
      try {
        if (isRefreshing) {
          // chờ AT mới
          return new Promise((resolve, reject) => {
            waiters.push((newAT) => {
              original.headers = original.headers ?? {};
              (original.headers as any).Authorization = `Bearer ${newAT}`;
              http.request(original).then(resolve).catch(reject);
            });
          });
        }

        isRefreshing = true;

        // cookie RT tự gửi, BE trả { accessToken }
        const resp = await refreshHttp.post('/auth/refresh');
        const { accessToken } = RefreshResponseSchema.parse(resp.data.data);

        useAuthStore.getState().setAccessToken(accessToken);

        waiters.forEach((cb) => cb(accessToken));
        waiters = [];

        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${accessToken}`;
        return http.request(original);
      } catch (e) {
        useAuthStore.getState().logout();
        waiters = [];
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
