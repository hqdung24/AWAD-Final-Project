// src/hooks/useSession.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMe,
  signin,
  signup,
  signout,
  googleAuthentication,
} from '@/services/authService';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { notify } from '@/lib/notify';
import { extractApiError } from '@/lib/api-error';
import { useNavigate } from 'react-router-dom';

export function useSession() {
  const setMe = useUserStore((s) => s.setMe);
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['me'],
    enabled: !!accessToken, // chỉ chạy khi có access token
    queryFn: async () => {
      const me = await getMe();
      if (!me) throw new Error('Failed to fetch user data');
      setMe(me);
      return me;
    },
    retry: false,
  });
}

export function useGoogleAuthentication() {
  const qc = useQueryClient();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setMe = useUserStore((s) => s.setMe);
  return useMutation({
    mutationFn: async (token: string) => {
      return await googleAuthentication(token);
    },
    onSuccess: async ({ accessToken, user }) => {
      setAccessToken(accessToken);
      setMe(user);
      notify.success('Signed in with Google!');
      await qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to signin with Google 😢');
    },
  });
}
export function useSignin() {
  const qc = useQueryClient();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setMe = useUserStore((s) => s.setMe);

  return useMutation({
    mutationFn: signin,
    onSuccess: async ({ accessToken, user }) => {
      setAccessToken(accessToken);
      setMe(user);
      notify.success('Signed in!');
      await qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to signin 😢');
    },
  });
}

export function useSignup() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      notify.success(data.msg || 'Signup successful! Please sign in.');
      navigate('/signin');
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to signup 😢');
    },
  });
}

export function useSignout() {
  const qc = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  const clearUser = useUserStore((s) => s.clear);

  return useMutation({
    mutationFn: signout,
    onSettled: async () => {
      logout();
      clearUser();
      await qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
