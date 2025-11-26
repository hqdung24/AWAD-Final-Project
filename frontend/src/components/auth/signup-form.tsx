import { cn } from '@/lib/utils';
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
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSignup, useGoogleAuthentication } from '@/hooks/useSession';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Link } from 'react-router';
const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], //gắn lỗi vào confirmPassword
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  const { mutateAsync, isPending } = useSignup();
  const { mutateAsync: mutateGoogleAsync, isPending: isGooglePending } =
    useGoogleAuthentication();
  const onSubmit = async (data: SignupFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...signupData } = data; //remove confirmPassword before sending to backend
    if (!isPending) await mutateAsync(signupData);
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
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email below to create your account
                </p>
              </div>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                    <Input
                      id="first-name"
                      type="text"
                      placeholder="John"
                      required
                      {...register('firstName')}
                    />
                    {errors.firstName && (
                      <span className="text-destructive text-sm">
                        {errors.firstName.message}
                      </span>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                    <Input
                      id="last-name"
                      type="text"
                      placeholder="Doe"
                      required
                      {...register('lastName')}
                    />
                    {errors.lastName && (
                      <span className="text-destructive text-sm">
                        {errors.lastName.message}
                      </span>
                    )}
                  </Field>
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-destructive text-sm">
                    {errors.email.message}
                  </span>
                )}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      required
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
                      required
                      {...register('confirmPassword')}
                    />
                    {errors.confirmPassword && (
                      <span className="text-destructive text-sm">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </Field>
                </Field>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer w-full"
                >
                  Create Account
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
                Already have an account? <Link to="/signin">Sign in</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover "
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
