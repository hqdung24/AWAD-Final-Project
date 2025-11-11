import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // dữ liệu “tươi” trong 1 phút
      refetchOnWindowFocus: false, // tránh giật UI
      retry: 3, // thử lại 3 lần nếu thất bại
    },
  },
});
