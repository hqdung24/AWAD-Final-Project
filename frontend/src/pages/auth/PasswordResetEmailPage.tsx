import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResetPassword } from '@/hooks/useSession';

const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;

export default function PasswordResetEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';
  const hasParams = email && token;

  const { mutateAsync, isPending } = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordForm) => {
    if (!hasParams) return;
    await mutateAsync({ email, token, password: values.password });
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
      <Card className="overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-muted-foreground text-sm">
                  Enter your new password to finish resetting your account
                </p>
              </div>

              {!hasParams && (
                <FieldDescription className="text-center text-destructive">
                  This link is missing required parameters.
                </FieldDescription>
              )}

              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && (
                  <span className="text-destructive text-sm">
                    {errors.password.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <span className="text-destructive text-sm">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!hasParams || isSubmitting || isPending}
                >
                  Reset Password
                </Button>
              </Field>

              <FieldDescription className="text-center">
                Remembered your password?{' '}
                <a href="/signin" className="text-primary hover:underline">
                  Sign in
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
