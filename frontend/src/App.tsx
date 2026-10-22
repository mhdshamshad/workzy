import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AuthSyncListener from './components/providers/AuthSyncListener';
import ScrollToTop from './components/providers/ScrollToTop';
import { Skeleton } from './components/ui/skeleton';
import PaymentSuccess from './pages/PaymentSuccess';

const UserRoutes = lazy(() => import('./routes/UserRoutes'));
const WorkerRoutes = lazy(() => import('./routes/WorkerRoutes'));
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthSyncListener />
      <ScrollToTop />
      <Suspense fallback={<Skeleton />}>
        <Routes>
          <Route path="/*" element={<UserRoutes />} />
          <Route path="/worker/*" element={<WorkerRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
