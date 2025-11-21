import React from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth';

type Props = {
  children: React.ReactNode;
};

export default function PublicRoute({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.accessToken !== undefined);

  // If user is authenticated, block access to public pages (signin/signup)
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
