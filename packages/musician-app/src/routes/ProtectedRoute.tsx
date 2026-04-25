import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@mygigs/shared';

interface Props { children: ReactNode; requireRole?: 'client' | 'musician' }

export const ProtectedRoute = ({ children, requireRole }: Props) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }
  if (requireRole && role !== requireRole) {
    return <div className="p-8 text-center text-red-400">This app is for {requireRole}s only.</div>;
  }
  return <>{children}</>;
};
