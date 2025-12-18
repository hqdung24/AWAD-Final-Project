import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVerifyEmail } from '@/hooks/useSession';
import { extractApiError } from '@/lib/api-error';

export default function VerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    mutate: verify,
    error,
    isPending,
    isSuccess,
    isError,
  } = useVerifyEmail();

  const payload = useMemo(() => {
    return {
      email: searchParams.get('email') || '',
      token: searchParams.get('token') || '',
    };
  }, [searchParams]);

  const hasParams = payload.email && payload.token;
  const statusText = useMemo(() => {
    if (!hasParams) return 'Missing email or token parameters.';
    if (isPending) return 'Verifying your email...';
    if (isSuccess)
      return 'Email verified successfully. Redirecting to sign in...';
    if (isError)
      return extractApiError(error).message || 'Verification failed.';
    return 'Verifying your email...';
  }, [error, hasParams, isError, isPending, isSuccess]);

  useEffect(() => {
    if (!hasParams) return;
    verify(payload);
  }, [hasParams, payload, verify]);

  useEffect(() => {
    if (!isSuccess && !isError) return;
    const timer = setTimeout(() => {
      if (isSuccess) {
        navigate('/signin?verified=1');
      } else {
        navigate('/signin');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isError, isSuccess, navigate]);

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-label="Loading"
        />
        <div className="text-lg font-semibold text-foreground">
          {statusText}
        </div>
        {!hasParams && (
          <div className="text-sm text-destructive">
            This link is missing required parameters.
          </div>
        )}
      </div>
    </div>
  );
}
