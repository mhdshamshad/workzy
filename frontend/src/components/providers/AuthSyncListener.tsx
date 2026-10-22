import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { setAxiosToken } from '@/lib/api/axios';
import { queryClient } from '@/lib/react-query/queryClient';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUser, refreshAccessToken } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';
import { broadcastAuthEvent, subscribeToAuthSync } from '@/utils/crossTabAuth';

export default function AuthSyncListener() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((s: RootState) => s.auth);

  useEffect(() => {
    const handleLogout = () => {
      dispatch(clearUser());
      setAxiosToken(null);
      queryClient.clear();

      const pathname = window.location.pathname;
      if (!pathname.startsWith('/login') && !pathname.startsWith('/register')) {
        navigate('/login', { replace: true });
      }
    };

    const unsubscribe = subscribeToAuthSync(event => {
      if (event.type === 'LOGOUT') {
        handleLogout();
      } else if (event.type === 'LOGIN') {
        if (!isAuthenticated) {
          dispatch(refreshAccessToken());
        }
      }
    });

    const handleLocalLogout = () => {
      handleLogout();
      broadcastAuthEvent({ type: 'LOGOUT' });
    };

    const handleBlocked = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      const message = customEvent.detail?.message || 'This account is blocked by Admin.';
      toast.error(message);
      handleLogout();
      broadcastAuthEvent({ type: 'LOGOUT' });
    };

    window.addEventListener('auth:logout', handleLocalLogout);
    window.addEventListener('auth:blocked', handleBlocked);

    return () => {
      unsubscribe();
      window.removeEventListener('auth:logout', handleLocalLogout);
      window.removeEventListener('auth:blocked', handleBlocked);
    };
  }, [dispatch, navigate, isAuthenticated]);

  return null;
}
