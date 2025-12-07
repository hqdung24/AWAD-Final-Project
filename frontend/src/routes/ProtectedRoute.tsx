import React from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth';
import type { RoleType } from '@/enum/role';

type Props = {
  children: React.ReactNode;
  roles?: RoleType[];
  allowGuest?: boolean;
};

export default function ProtectedRoute({
  children,
  roles,
  allowGuest = false,
}: Props) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);

  // Allow guest access when explicitly enabled
  if (!accessToken && allowGuest) {
    return <>{children}</>;
  }

  // Not authenticated
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  // If roles are required but role is not yet loaded, wait for hydration
  if (roles && role === undefined) {
    return null; // Or show a loading spinner
  }

  // Check if user has required role
  if (roles && !roles.includes(role as RoleType)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
