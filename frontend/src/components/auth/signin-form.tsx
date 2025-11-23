import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSignin, useGoogleAuthentication } from '@/hooks/useSession';
import { useNavigate } from 'react-router';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { SigninPayloadSchema } from '@/schemas';

type SigninFormData = z.infer<typeof SigninPayloadSchema>;

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(SigninPayloadSchema),
  });
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useSignin();
  const { mutateAsync: mutateGoogleAsync, isPending: isGooglePending } =
    useGoogleAuthentication();
  const onSubmit = async (form: {
    emailOrUsername: string;
    password: string;
  }) => {
    if (!isPending) await mutateAsync(form);
    navigate('/');
  };

  const handleGoogleSignUpSuccess = async (response: CredentialResponse) => {
    const token = response.credential;

    if (token && !isGooglePending) await mutateGoogleAsync(token);
  };

  const handleGoogleSignUpFailed = () => {
    console.log('Google sign-up failed');
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email and password to sign in
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register('emailOrUsername')}
                />
                {errors.emailOrUsername && (
                  <span className="text-destructive text-sm">
                    {errors.emailOrUsername.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
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
                <Button type="submit" disabled={isSubmitting}>
                  Sign In
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              {/* Social signup buttons can be added here */}
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSignUpSuccess}
                  onError={handleGoogleSignUpFailed}
                  text="signup_with"
                  shape="rectangular" // try to influence shape
                  size="large"
                  containerProps={{
                    className:
                      'google-btn-container rounded-md overflow-hidden',
                  }}
                />
              </div>
              <FieldDescription className="text-center">
                Don’t have an account? <a href="/signup">Create one</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
