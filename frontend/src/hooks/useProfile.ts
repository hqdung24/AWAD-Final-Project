import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user';
import { updateMyNotificationPreferences } from '@/services/notificationService';
import { changePassword, setPassword, updateMe } from '@/services/authService';
import {
  createPresignedUrlForAvatar,
  uploadFileToS3,
  confirmAvatarUpload,
} from '@/services/userService';
import { extractApiError } from '@/lib/api-error';
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
    onError: (err) => {
      const { message } = extractApiError(err);
      toast.error(message || 'Failed to update profile');
    },
  });

  const updatePassword = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password updated');
    },
    onError: (err: unknown) => {
      const message =
        extractApiError(err).message || 'Failed to update password';
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
    onError: (err) => {
      const message = extractApiError(err).message || 'Failed to set password';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!me?.id) {
        throw new Error('User ID not found');
      }

      const extension = file.name.split('.').pop();

      // Get presigned URL from backend
      const presigned = await createPresignedUrlForAvatar(me.id, extension);

      //  Upload file directly to S3/R2 using presigned URL
      await uploadFileToS3(presigned.uploadUrl, file);

      // Confirm upload and bind avatar to user
      const confirmed = await confirmAvatarUpload(presigned.key, me.id);

      return confirmed;
    },
    onSuccess: (data) => {
      if (me) {
        setMe({ ...me, avatarUrl: data.url });
      }
      queryClient
        .invalidateQueries({ queryKey: ['me'] })
        .catch(() => undefined);
      toast.success('Avatar updated successfully');
    },
    onError: (err) => {
      const message = extractApiError(err).message || 'Failed to upload avatar';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  return {
    updatePreferences,
    updateProfile,
    updatePassword,
    setNewPassword,
    uploadAvatar,
  };
}
