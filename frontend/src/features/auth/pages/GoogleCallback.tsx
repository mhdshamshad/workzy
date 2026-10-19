import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { AUTH_MESSAGES } from '@/constants';
import { useAppDispatch } from '@/store/hooks';
import { refreshAccessToken } from '@/store/slices/authSlice';
import { AUTH_REDIRECT_STORAGE_KEY, getInternalRedirectPath } from '@/utils/authRedirect';
import { redirectBasedOnRole } from '@/utils/redirectBasedOnRole';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const from = getInternalRedirectPath(sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY));
    const error = searchParams.get('error');
    if (error === 'blocked') {
      sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
      navigate('/login', { state: { blocked: true, from }, replace: true });
      return;
    }
    if (error) {
      sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
      toast.error(
        error === 'google_auth_failed'
          ? "We couldn't complete Google sign-in. Please try again."
          : AUTH_MESSAGES.AUTH_FAILED
      );
      navigate('/login', { state: { from }, replace: true });
      return;
    }

    dispatch(refreshAccessToken())
      .unwrap()
      .then(data => {
        sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
        redirectBasedOnRole(data.user.role, navigate, from);
      })
      .catch(() => {
        sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
        toast.error(AUTH_MESSAGES.AUTH_FAILED);
        navigate('/login', { state: { from }, replace: true });
      });
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
        <p className="mt-4 text-muted-foreground">Completing Google sign in...</p>
      </div>
    </div>
  );
}
