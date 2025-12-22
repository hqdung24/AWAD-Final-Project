import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyNotificationPreferences, updateMyNotificationPreferences } from '@/services/notificationService';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user';
import { changePassword, updateMe } from '@/services/authService';
import { useEffect, useState } from 'react';

export default function AccountInfoPage() {
  const { me, setMe } = useUserStore();
  const queryClient = useQueryClient();
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (!me) return;
    setProfileForm({
      firstName: me.firstName ?? '',
      lastName: me.lastName ?? '',
      email: me.email ?? '',
    });
  }, [me]);

  const preferencesQuery = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: getMyNotificationPreferences,
  });

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
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      toast.success('Password updated');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to update password';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    },
  });

  const handleToggle = (
    field: 'emailRemindersEnabled' | 'smsRemindersEnabled',
    value: boolean
  ) => {
    updatePreferences.mutate({ [field]: value });
  };

  const smsDisabled = !me?.phone;

  return (
    <div className="bg-background p-6 flex flex-col items-center gap-4 overflow-hidden">
      <Card className="w-full max-w-2xl">
        {/*Back button*/}
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View and manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/diverse-user-avatars.png" alt="User avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Profile Picture</h3>
              <p className="text-sm text-muted-foreground">
                Your account avatar
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={profileForm.firstName}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={profileForm.lastName}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="username" disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="password"
                  defaultValue="••••••••••"
                  disabled
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm((prev) => !prev)}
                >
                  Change
                </Button>
              </div>
            </div>
            {showPasswordForm && (
              <div className="grid gap-3 rounded-md border p-3">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
                        toast.error('Please fill all password fields');
                        return;
                      }
                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        toast.error('New password confirmation does not match');
                        return;
                      }
                      updatePassword.mutate({
                        currentPassword: passwordForm.currentPassword,
                        newPassword: passwordForm.newPassword,
                      });
                    }}
                    disabled={updatePassword.isPending}
                  >
                    Update password
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordForm({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (!me) return;
                setProfileForm({
                  firstName: me.firstName ?? '',
                  lastName: me.lastName ?? '',
                  email: me.email ?? '',
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateProfile.mutate(profileForm)}
              disabled={updateProfile.isPending}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose how you want to receive trip updates and reminders.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferencesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading preferences…</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive booking reminders and important updates by email.
                  </p>
                </div>
                <Checkbox
                  checked={
                    preferencesQuery.data?.emailRemindersEnabled ?? false
                  }
                  onCheckedChange={(value) =>
                    handleToggle('emailRemindersEnabled', Boolean(value))
                  }
                  disabled={updatePreferences.isPending}
                  aria-label="Toggle email notifications"
                />
              </div>

              <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium">SMS notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get reminders by SMS before your trip. Requires a phone
                    number on your account.
                  </p>
                  {smsDisabled && (
                    <p className="text-xs text-muted-foreground">
                      Add a phone number to enable SMS notifications.
                    </p>
                  )}
                </div>
                <Checkbox
                  checked={
                    preferencesQuery.data?.smsRemindersEnabled ?? false
                  }
                  onCheckedChange={(value) =>
                    handleToggle('smsRemindersEnabled', Boolean(value))
                  }
                  disabled={updatePreferences.isPending || smsDisabled}
                  aria-label="Toggle SMS notifications"
                />
              </div>

              {preferencesQuery.data?.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(preferencesQuery.data.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
