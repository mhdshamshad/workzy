import React, { useEffect } from 'react';

import AppLoader from '@/components/atoms/AppLoader';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { refreshAccessToken } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(refreshAccessToken());
    }
  }, [dispatch, status]);

  if (status === 'idle' || status === 'loading') {
    return <AppLoader title="Loading Workzy..." subtitle="Verifying your session..." />;
  }

  return <>{children}</>;
}
