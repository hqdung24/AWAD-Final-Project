// src/stores/auth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  accessToken?: string;
};
type AuthAction = {
  setAccessToken: (t?: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState & AuthAction>()(
  persist(
    (set) => ({
      accessToken: undefined,
      setAccessToken: (t) => set({ accessToken: t }),
      logout: () => set({ accessToken: undefined }),
    }),
    {
      name: 'auth-store',
      // chỉ lưu token (và không lưu isAuthenticated vì nó được derived sau kiểm tra)
      partialize: (s) => ({
        accessToken: s.accessToken,
      }),
    }
  )
);
