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
import { useProfile } from '@/hooks/useProfile';
import { useUserStore } from '@/stores/user';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AccountInfoPage() {
  const { me } = useUserStore();
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
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
      username: me.username ?? '',
    });
  }, [me]);

  const { updateProfile, updatePassword, setNewPassword, uploadAvatar } =
    useProfile();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    uploadAvatar.mutate(file);
  };

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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={me?.avatarUrl || '/default-avatar.png'}
                  alt="User avatar"
                />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  Your account avatar
                </p>
              </div>
            </div>
            <div>
              <input
                type="file"
                id="avatar-input"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploadAvatar.isPending}
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => document.getElementById('avatar-input')?.click()}
                disabled={uploadAvatar.isPending}
              >
                {uploadAvatar.isPending ? 'Uploading...' : 'Change Avatar'}
              </Button>
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
                  setProfileForm((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={profileForm.lastName}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder={profileForm.username ? '' : 'Choose a username'}
                value={profileForm.username}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                disabled
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
                  variant="secondary"
                  onClick={() => setShowPasswordForm((prev) => !prev)}
                >
                  {me?.hasSetPassword ? 'Change' : 'Set'}
                </Button>
              </div>
            </div>
            {showPasswordForm && (
              <div className="grid gap-3 rounded-md border p-3">
                {me?.hasSetPassword && (
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
                )}
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
                      if (!passwordForm.newPassword) {
                        toast.error('Please fill the new password');
                        return;
                      }
                      if (
                        passwordForm.newPassword !==
                        passwordForm.confirmPassword
                      ) {
                        toast.error('New password confirmation does not match');
                        return;
                      }
                      if (me?.hasSetPassword) {
                        if (!passwordForm.currentPassword) {
                          toast.error('Please fill current password');
                          return;
                        }
                        updatePassword.mutate(
                          {
                            currentPassword: passwordForm.currentPassword,
                            newPassword: passwordForm.newPassword,
                          },
                          {
                            onSuccess: () => {
                              setPasswordForm({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                              });
                              setShowPasswordForm(false);
                            },
                          }
                        );
                      } else {
                        setNewPassword.mutate(
                          {
                            newPassword: passwordForm.newPassword,
                          },
                          {
                            onSuccess: () => {
                              setPasswordForm({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                              });
                              setShowPasswordForm(false);
                            },
                          }
                        );
                      }
                    }}
                    disabled={
                      updatePassword.isPending || setNewPassword.isPending
                    }
                  >
                    {me?.hasSetPassword ? 'Update password' : 'Set password'}
                  </Button>
                  <Button
                    variant="secondary"
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
          {showPasswordForm ? null : (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!me) return;
                  setProfileForm({
                    firstName: me.firstName ?? '',
                    lastName: me.lastName ?? '',
                    email: me.email ?? '',
                    username: me.username ?? '',
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
