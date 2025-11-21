// src/stores/user.ts
import { create } from 'zustand';
import type { Me } from '@/schemas/auth/signin.response';

export const useUserStore = create<{
  me?: Me;
  setMe: (u?: Me) => void;
  clear: () => void;
}>()((set) => ({
  me: undefined,
  setMe: (u) => set({ me: u }),
  clear: () => set({ me: undefined }),
}));
