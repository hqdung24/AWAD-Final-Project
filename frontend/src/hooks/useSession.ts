// src/hooks/useSession.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMe,
  signin,
  signup,
  signout,
  googleAuthentication,
  requestPasswordReset,
  verifyEmail,
  resetPassword,
} from '@/services/authService';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { notify } from '@/lib/notify';
import { extractApiError } from '@/lib/api-error';
import { useNavigate } from 'react-router-dom';
import type { RoleType } from '@/enum/role';

export function useSession() {
  const setMe = useUserStore((s) => s.setMe);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setRole = useAuthStore((s) => s.setRole);
  const logout = useAuthStore((s) => s.logout);

  return useQuery({
    queryKey: ['me'],
    enabled: !!accessToken, // chỉ chạy khi có access token
    queryFn: async () => {
      try {
        const me = await getMe();
        if (!me) throw new Error('Failed to fetch user data');
        setRole(me.role as RoleType);
        setMe(me);
        return me;
      } catch (error) {
        // If 401, clear auth state
        logout();
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useGoogleAuthentication() {
  const qc = useQueryClient();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setRole = useAuthStore((s) => s.setRole);
  const setMe = useUserStore((s) => s.setMe);
  return useMutation({
    mutationFn: async (token: string) => {
      return await googleAuthentication(token);
    },
    onSuccess: async ({ accessToken, user }) => {
      setAccessToken(accessToken);
      setRole(user.role as RoleType);
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
  const setRole = useAuthStore((s) => s.setRole);
  const setMe = useUserStore((s) => s.setMe);

  return useMutation({
    mutationFn: signin,
    onSuccess: async ({ accessToken, user }) => {
      setAccessToken(accessToken);
      console.log('role: ', user.role);
      setRole(user.role as RoleType);
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

export function useRequestPasswordReset() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (email: string) => requestPasswordReset(email),
    onSuccess: (data) => {
      notify.success(data.msg || 'Password reset email sent');
      navigate('/signin');
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to send reset link 😢');
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}

export function useResetPassword() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      notify.success(data.msg || 'Password reset successfully');
      navigate('/signin');
    },
    onError: (err) => {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to reset password');
    },
  });
}
