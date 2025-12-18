import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRequestPasswordReset } from '@/hooks/useSession';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { mutateAsync, isPending } = useRequestPasswordReset();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    await mutateAsync(email);
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
                <h1 className="text-2xl font-bold">Forgot Password</h1>
                <p className="text-muted-foreground text-sm">
                  Enter your email to receive a reset link
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-destructive text-sm">
                    {errors.email.message}
                  </span>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting || isPending}
                  className="w-full"
                >
                  Send Reset Link
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
