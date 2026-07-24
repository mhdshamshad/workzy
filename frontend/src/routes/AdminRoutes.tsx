import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import AdminWorkerDocumentsPage from '@/features/admin/worker/pages/AdminWorkerDocumentsPage';
import AdminWorkerServicesPage from '@/features/admin/worker/pages/AdminWorkerServicesPage';

import ProtectedRoute from './ProtectedRoute';

const AdminLayout = lazy(() => import('@/layouts/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/features/admin/dashboard/pages/AdminDashboard'));
const UserManagementPage = lazy(() => import('@/features/admin/user/pages/UserMangementPage'));
const UserDetailsLayout = lazy(() => import('@/features/admin/user/pages/UserDetailsLayout'));
const AdminWorkerManagementPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerManagementPage')
);
const WorkerDetailsLayout = lazy(
  () => import('@/features/admin/worker/wrapper/WorkerDetailsLayout')
);
const AdminWorkerAboutPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerAboutPage')
);

const CategoryManagementPage = lazy(
  () => import('@/features/admin/service/pages/CategoryManagementPage')
);
const AdminChatPage = lazy(() => import('@/features/admin/chat/pages/AdminChatPage'));
const AdminDisputesPage = lazy(() => import('@/features/admin/disputes/pages/AdminDisputesPage'));
const HomePageLayout = lazy(() => import('@/features/admin/home/layout/HomeLayout'));

const HomeSectionPage = lazy(() => import('@/features/admin/home/pages/HomeSectionPage'));
const HomeLayoutPage = lazy(() => import('@/features/admin/home/pages/HomeLayoutPage'));
const AdminReviewsPage = lazy(() => import('@/features/admin/reviews/pages/AdminReviewsPage'));
const AdminBookingPage = lazy(() => import('@/features/admin/booking/pages/AdminBookingPage'));
const AdminPaymentsPage = lazy(() => import('@/features/admin/payments/pages/AdminPaymentsPage'));
const AdminBookingDetailsPage = lazy(
  () => import('@/features/admin/booking/pages/AdminBookingDetailsPage')
);

export default function AdminRoutes() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="users">
              <Route index element={<UserManagementPage />} />
              <Route path=":userId" element={<UserDetailsLayout />} />
            </Route>

            <Route path="workers">
              <Route index element={<AdminWorkerManagementPage />} />
              <Route path=":workerId" element={<WorkerDetailsLayout />}>
                <Route index element={<AdminWorkerAboutPage />} />
                <Route path="documents" element={<AdminWorkerDocumentsPage />} />
                <Route path="services" element={<AdminWorkerServicesPage />} />
                <Route path="bookings" element={<AdminWorkerAboutPage />} />
                <Route path="reviews" element={<AdminWorkerAboutPage />} />
                <Route path="quotes" element={<AdminWorkerAboutPage />} />
                <Route path="disputes" element={<AdminWorkerAboutPage />} />
                <Route path="payments" element={<AdminWorkerAboutPage />} />
              </Route>
            </Route>

            <Route path="bookings" element={<AdminBookingPage />} />
            <Route path="bookings/:bookingId" element={<AdminBookingDetailsPage />} />

            <Route path="payments" element={<AdminPaymentsPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="disputes" element={<AdminDisputesPage />} />
            <Route path="categories" element={<CategoryManagementPage />} />

            <Route path="messages">
              <Route index element={<AdminChatPage />} />
              <Route path=":chatId" element={<AdminChatPage />} />
            </Route>

            <Route path="home" element={<HomePageLayout />}>
              <Route index element={<HomeLayoutPage />} />
              <Route path="sections" element={<HomeSectionPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
