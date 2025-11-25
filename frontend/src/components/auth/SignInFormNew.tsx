import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { type CredentialResponse } from '@react-oauth/google';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { SocialAuth } from '@/components/auth/SocialAuth';
import { Stack } from '@/components/layout/Stack';

import { useSignin, useGoogleAuthentication } from '@/hooks/useSession';
import { useAuthContent } from '@/hooks/useContent';
import { SigninPayloadSchema } from '@/schemas';

type SigninFormData = z.infer<typeof SigninPayloadSchema>;

export function SignInFormNew() {
    const navigate = useNavigate();
    const content = useAuthContent().signin;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SigninFormData>({
        resolver: zodResolver(SigninPayloadSchema),
    });

    const { mutateAsync: signIn, isPending } = useSignin();
    const { mutateAsync: googleSignIn, isPending: isGooglePending } =
        useGoogleAuthentication();

    const onSubmit = async (data: SigninFormData) => {
        if (!isPending) {
            await signIn(data);
            navigate('/');
        }
    };

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        const token = response.credential;
        if (token && !isGooglePending) {
            await googleSignIn(token);
            navigate('/');
        }
    };

    const handleGoogleError = () => {
        console.error('Google sign-in failed');
    };

    return (
        <AuthLayout title={content.title} subtitle={content.subtitle}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing="lg">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="emailOrUsername">
                                {content.emailLabel}
                            </FieldLabel>
                            <Input
                                id="emailOrUsername"
                                type="text"
                                placeholder={content.emailPlaceholder}
                                autoComplete="username"
                                className="h-11"
                                {...register('emailOrUsername')}
                                aria-invalid={!!errors.emailOrUsername}
                            />
                            {errors.emailOrUsername && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.emailOrUsername.message}
                                </p>
                            )}
                        </Field>

                        <Field>
                            <div className="flex items-center justify-between">
                                <FieldLabel htmlFor="password">
                                    {content.passwordLabel}
                                </FieldLabel>
                                <button
                                    type="button"
                                    className="text-xs text-primary hover:underline"
                                    onClick={() => console.log('Forgot password clicked')}
                                >
                                    {content.forgotPassword}
                                </button>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder={content.passwordPlaceholder}
                                autoComplete="current-password"
                                className="h-11"
                                {...register('password')}
                                aria-invalid={!!errors.password}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </Field>
                    </FieldGroup>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || isPending}
                        className="w-full h-11"
                    >
                        {isPending ? 'Signing in...' : content.submitButton}
                    </Button>

                    <SocialAuth
                        onGoogleSuccess={handleGoogleSuccess}
                        onGoogleError={handleGoogleError}
                        dividerText={content.orDivider}
                    />

                    <p className="text-center text-sm text-muted-foreground">
                        {content.noAccount}{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/signup')}
                            className="text-primary hover:underline font-medium"
                        >
                            {content.signupLink}
                        </button>
                    </p>
                </Stack>
            </form>
        </AuthLayout>
    );
}
