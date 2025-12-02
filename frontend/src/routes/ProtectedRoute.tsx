import React from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth';
import type { RoleType } from '@/enum/role';

type Props = {
  children: React.ReactNode;
  roles?: RoleType[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const isAuthenticated = useAuthStore((s) => s.accessToken !== undefined);
  const role = useAuthStore((s) => s.role);
  console.log(role);
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Check role
  if (roles && role === undefined) {
    // wait for role to hydrate (avoid false 403)
    return null;
  }

  const hasRole = roles ? roles.includes(role as RoleType) : true;
  if (!hasRole) return <Navigate to="/403" />;

  return <>{children}</>;
}
