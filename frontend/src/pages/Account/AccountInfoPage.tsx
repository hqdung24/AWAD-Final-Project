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

export default function AccountInfoPage() {
  const { me } = useUserStore();
  const queryClient = useQueryClient();

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
              <Input id="firstName" defaultValue={me?.firstName} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" defaultValue={me?.lastName} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="username" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={me?.email} />
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
                <Button variant="outline">Change</Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
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
