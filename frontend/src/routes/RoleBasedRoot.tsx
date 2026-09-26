import { lazy, Suspense, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

import { ROLE } from '@/constants';
import LoadingHome from '@/features/user/home/components/LoadingHome';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { syncUserLocation } from '@/utils/locationSync';

const HomePage = lazy(() => import('@/pages/Home'));

export default function RoleBasedRoot() {
  const { user, isAuthenticated, status } = useAppSelector((s: RootState) => s.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isAuthenticated && user) {
      syncUserLocation(dispatch, user);
    }
  }, [dispatch, isAuthenticated, user]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Suspense fallback={<LoadingHome />}>
        <HomePage />
      </Suspense>
    );
  }

  if (user.role === ROLE.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === ROLE.WORKER) {
    return <Navigate to="/worker/dashboard" replace />;
  }

  return (
    <Suspense fallback={<LoadingHome />}>
      <HomePage />
    </Suspense>
  );
}
