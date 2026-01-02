import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useProfile } from '@/hooks/useProfile';
import { getMyNotificationPreferences } from '@/services/notificationService';
import { useUserStore } from '@/stores/user';
import { useQuery } from '@tanstack/react-query';

interface NotificationPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPreferencesModal({
  open,
  onOpenChange,
}: NotificationPreferencesModalProps) {
  const { me } = useUserStore();

  const preferencesQuery = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: getMyNotificationPreferences,
  });

  const { updatePreferences } = useProfile();

  const handleToggle = (
    field: 'emailRemindersEnabled' | 'smsRemindersEnabled',
    value: boolean
  ) => {
    updatePreferences.mutate({ [field]: value });
  };

  const smsDisabled = !me?.phone;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>
            Choose how you want to receive trip updates and reminders.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {preferencesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading preferences…
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium">In App notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Get instant notifications within the app (default enabled).
                  </p>
                </div>
                <Checkbox
                  checked={true}
                  disabled={true}
                  aria-label="In App notifications"
                />
              </div>

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
                  checked={preferencesQuery.data?.smsRemindersEnabled ?? false}
                  onCheckedChange={(value) =>
                    handleToggle('smsRemindersEnabled', Boolean(value))
                  }
                  disabled={updatePreferences.isPending || smsDisabled}
                  aria-label="Toggle SMS notifications"
                />
              </div>

              {preferencesQuery.data?.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated:{' '}
                  {new Date(preferencesQuery.data.updatedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
