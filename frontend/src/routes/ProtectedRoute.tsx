import React from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '@/stores/auth';
import type { RoleType } from '@/enum/role';

type Props = {
  children: React.ReactNode;
  roles?: RoleType[];
};

export default function ProtectedRoute({ children, roles }: Props) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.role);
  
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
