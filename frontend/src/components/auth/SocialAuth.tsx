import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { cn } from '@/lib/utils';

interface SocialAuthProps {
    onGoogleSuccess: (response: CredentialResponse) => void;
    onGoogleError?: () => void;
    className?: string;
    dividerText?: string;
}

export function SocialAuth({
    onGoogleSuccess,
    onGoogleError,
    className,
    dividerText = 'Or continue with',
}: SocialAuthProps) {
    return (
        <div className={cn('space-y-4', className)}>
            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        {dividerText}
                    </span>
                </div>
            </div>

            {/* Google OAuth Button */}
            <div className="flex justify-center w-full [&_div]:w-full [&_iframe]:h-11! [&_div[role=button]]:h-11!">
                <GoogleLogin
                    onSuccess={onGoogleSuccess}
                    onError={onGoogleError}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    width="100%"
                />
            </div>
        </div>
    );
}
