import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import AppLoader from '@/components/atoms/AppLoader';

import Footer from './Footer';
import Header from './Header';

export default function UserLayout() {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/messages');

  return (
    <div className="flex min-h-screen flex-col bg-background w-full">
      <Header />
      <main className="flex-1 flex flex-col pt-16 overflow-x-hidden">
        <Suspense fallback={<AppLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
}
