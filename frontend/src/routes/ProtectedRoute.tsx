import { Navigate, Outlet, useLocation } from 'react-router-dom';

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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-9 w-9 border-4 border-gray-200 border-t-blue-500" />
      </div>
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
