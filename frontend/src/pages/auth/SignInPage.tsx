import { SignInForm } from '@/components/auth/signin-form';
import { useSearchParams } from 'react-router-dom';

const SignInPage = () => {
  const [searchParams] = useSearchParams();
  const fromVerification = searchParams.get('verified') === '1';

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-xl">
        {fromVerification && (
          <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            Email verified successfully. Please sign in to continue.
          </div>
        )}
        <SignInForm />
      </div>
    </div>
  );
};

export default SignInPage;
