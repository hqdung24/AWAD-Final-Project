// src/stores/auth.ts
import { create } from 'zustand';

type AuthState = {
  isAuthenticated: boolean;
  accessToken?: string;
};
type AuthAction = {
  setAccessToken: (t?: string) => void;
  setAuthenticated: (ok: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState & AuthAction>()((set) => ({
  isAuthenticated: false,
  accessToken: undefined,
  setAccessToken: (t) => set({ accessToken: t }),
  setAuthenticated: (ok) => set({ isAuthenticated: ok }),
  logout: () => set({ isAuthenticated: false, accessToken: undefined }),
}));
