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
import { Grid } from '@/components/layout/Grid';

import { useSignup, useGoogleAuthentication } from '@/hooks/useSession';
import { useAuthContent } from '@/hooks/useContent';

const SignupSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupFormData = z.infer<typeof SignupSchema>;

export function SignUpFormNew() {
    const navigate = useNavigate();
    const content = useAuthContent().signup;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormData>({
        resolver: zodResolver(SignupSchema),
    });

    const { mutateAsync: signUp, isPending } = useSignup();
    const { mutateAsync: googleSignUp, isPending: isGooglePending } =
        useGoogleAuthentication();

    const onSubmit = async (data: SignupFormData) => {
        if (!isPending) {
            await signUp(data);
        }
    };

    const handleGoogleSuccess = async (response: CredentialResponse) => {
        const token = response.credential;
        if (token && !isGooglePending) {
            await googleSignUp(token);
            navigate('/');
        }
    };

    const handleGoogleError = () => {
        console.error('Google sign-up failed');
    };

    return (
        <AuthLayout title={content.title} subtitle={content.subtitle}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Stack spacing="lg">
                    <FieldGroup>
                        <Grid cols={2} gap="md">
                            <Field>
                                <FieldLabel htmlFor="firstName">
                                    {content.firstNameLabel}
                                </FieldLabel>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder={content.firstNamePlaceholder}
                                    autoComplete="given-name"
                                    className="h-11"
                                    {...register('firstName')}
                                    aria-invalid={!!errors.firstName}
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-destructive mt-1">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="lastName">
                                    {content.lastNameLabel}
                                </FieldLabel>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder={content.lastNamePlaceholder}
                                    autoComplete="family-name"
                                    className="h-11"
                                    {...register('lastName')}
                                    aria-invalid={!!errors.lastName}
                                />
                                {errors.lastName && (
                                    <p className="text-xs text-destructive mt-1">
                                        {errors.lastName.message}
                                    </p>
                                )}
                            </Field>
                        </Grid>

                        <Field>
                            <FieldLabel htmlFor="username">
                                {content.usernameLabel}
                            </FieldLabel>
                            <Input
                                id="username"
                                type="text"
                                placeholder={content.usernamePlaceholder}
                                autoComplete="username"
                                className="h-11"
                                {...register('username')}
                                aria-invalid={!!errors.username}
                            />
                            {errors.username && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.username.message}
                                </p>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">
                                {content.emailLabel}
                            </FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder={content.emailPlaceholder}
                                autoComplete="email"
                                className="h-11"
                                {...register('email')}
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password">
                                {content.passwordLabel}
                            </FieldLabel>
                            <Input
                                id="password"
                                type="password"
                                placeholder={content.passwordPlaceholder}
                                autoComplete="new-password"
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
                        {isPending ? 'Creating account...' : content.submitButton}
                    </Button>

                    <SocialAuth
                        onGoogleSuccess={handleGoogleSuccess}
                        onGoogleError={handleGoogleError}
                        dividerText={content.orDivider}
                    />

                    <p className="text-center text-sm text-muted-foreground">
                        {content.hasAccount}{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/signin')}
                            className="text-primary hover:underline font-medium"
                        >
                            {content.signinLink}
                        </button>
                    </p>
                </Stack>
            </form>
        </AuthLayout>
    );
}
