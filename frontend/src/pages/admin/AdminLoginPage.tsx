import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { notify } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { SigninPayloadSchema } from '@/schemas';
import { extractApiError } from '@/lib/api-error';
import { signin, signout } from '@/services/authService';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import type { RoleType } from '@/enum/role';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

type SigninFormData = z.infer<typeof SigninPayloadSchema>;

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setRole = useAuthStore((s) => s.setRole);
  const setMe = useUserStore((s) => s.setMe);
  const clearMe = useUserStore((s) => s.clear);
  const logout = useAuthStore((s) => s.logout);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(SigninPayloadSchema),
  });

  const onSubmit = async (form: SigninFormData) => {
    try {
      const result = await signin(form);
      const role = result?.user?.role;
      if (role !== 'ADMIN' && role !== 'MODERATOR') {
        notify.error('This account is not authorized for admin access.');
        await signout();
        logout();
        clearMe();
        return;
      }
      const normalizedRole: RoleType =
        role === 'MODERATOR' ? 'ADMIN' : (role as RoleType);
      setAccessToken(result.accessToken);
      setRole(normalizedRole);
      setMe(result.user);
      notify.success('Signed in!');
      navigate('/overview');
    } catch (err) {
      const { message } = extractApiError(err);
      notify.error(message || 'Failed to signin 😢');
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-xl">
        <div className={cn('flex flex-col gap-6')}>
          <Card className="overflow-hidden p-0">
            <CardContent className="p-6 md:p-8">
              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Admin sign in</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                      Use your admin credentials to continue
                    </p>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
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
                    <div className="flex justify-end mt-2">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </Field>

                  <Field>
                    <Button type="submit" disabled={isSubmitting}>
                      Sign In
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          <FieldDescription className="px-6 text-center">
            Not an admin? <Link to="/signin">Go to customer sign in</Link>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
