import { ROLE } from '@/constants';

import type { NavigateFunction } from 'react-router-dom';

export function redirectBasedOnRole(
  role: string,
  navigate: NavigateFunction,
  userRedirectPath?: string
) {
  if (role === ROLE.ADMIN) {
    navigate('/admin/dashboard', { replace: true });
  } else if (role === ROLE.WORKER) {
    navigate('/worker/dashboard', { replace: true });
  } else {
    navigate(userRedirectPath ?? '/', { replace: true });
  }
}
