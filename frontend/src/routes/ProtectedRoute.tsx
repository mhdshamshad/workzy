import { Navigate, Outlet, useLocation } from 'react-router-dom';

import AppLoader from '@/components/atoms/AppLoader';
import { ROLE, type Role } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

import type React from 'react';

type ProtectedRouteProps = {
  requiredRoles?: Role[];
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { user, accessToken, status } = useAppSelector((s: RootState) => s.auth);
  const location = useLocation();

  if (status === 'loading') {
    return (
      <AppLoader title="Checking authorization..." subtitle="Verifying your account access." />
    );
  }

  if (!accessToken || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
        replace
      />
    );
  }

  if (requiredRoles && (!user.role || !requiredRoles.includes(user.role))) {
    if (user.role === ROLE.USER) {
      return <Navigate to="/" replace />;
    }
    if (user.role === ROLE.WORKER) {
      return <Navigate to="/worker/dashboard" replace />;
    }
    if (user.role === ROLE.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
