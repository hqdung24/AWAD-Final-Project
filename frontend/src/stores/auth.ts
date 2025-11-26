// src/stores/auth.ts
import type { RoleType } from '@/enum/role';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  accessToken?: string;
  role?: RoleType;
};
type AuthAction = {
  setAccessToken: (t?: string) => void;
  setRole: (r?: RoleType) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState & AuthAction>()(
  persist(
    (set) => ({
      accessToken: undefined,
      role: undefined,
      setAccessToken: (t) => set({ accessToken: t }),
      setRole: (r) => set({ role: r }),
      logout: () => set({ accessToken: undefined, role: undefined }),
    }),
    {
      name: 'auth-store',
      // chỉ lưu token (và không lưu isAuthenticated vì nó được derived sau kiểm tra)
      partialize: (s) => ({
        accessToken: s.accessToken,
        role: s.role,
      }),
    }
  )
);
