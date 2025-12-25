import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user';
import { updateMyNotificationPreferences } from '@/services/notificationService';
import { changePassword, setPassword, updateMe } from '@/services/authService';

export function useProfile() {
  const { me, setMe } = useUserStore();
  const queryClient = useQueryClient();

  const updatePreferences = useMutation({
    mutationFn: updateMyNotificationPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-preferences'], data);
      toast.success('Notification preferences updated');
    },
    onError: () => {
      toast.error('Failed to update notification preferences');
    },
  });

  const updateProfile = useMutation({
    mutationFn: updateMe,
    onSuccess: (data) => {
      setMe(data);
      toast.success('Profile updated');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const updatePassword = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password updated');
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update password';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const setNewPassword = useMutation({
    mutationFn: setPassword,
    onSuccess: () => {
      toast.success('Password set successfully');
      if (me) {
        setMe({ ...me, isActive: true });
      }
      queryClient
        .invalidateQueries({ queryKey: ['me'] })
        .catch(() => undefined);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to set password';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  return { updatePreferences, updateProfile, updatePassword, setNewPassword };
}
