import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';

import ProtectedRoute from './ProtectedRoute';

const AdminLayout = lazy(() => import('@/layouts/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/features/admin/dashboard/pages/AdminDashboard'));
const UserManagementPage = lazy(() => import('@/features/admin/user/pages/UserMangementPage'));
const UserDetailsLayout = lazy(() => import('@/features/admin/user/wrapper/UserDetailsLayout'));
const AdminUserOverviewPage = lazy(
  () => import('@/features/admin/user/pages/AdminUserOverviewPage')
);
const AdminUserBookingsPage = lazy(
  () => import('@/features/admin/user/pages/AdminUserBookingsPage')
);
const AdminUserDisputesPage = lazy(
  () => import('@/features/admin/user/pages/AdminUserDisputesPage')
);
const AdminUserReviewsPage = lazy(() => import('@/features/admin/user/pages/AdminUserReviewsPage'));
const AdminUserQuotesPage = lazy(() => import('@/features/admin/user/pages/AdminUserQuotesPage'));
const AdminUserPaymentsPage = lazy(
  () => import('@/features/admin/user/pages/AdminUserPaymentsPage')
);
const AdminWorkerManagementPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerManagementPage')
);
const WorkerDetailsLayout = lazy(
  () => import('@/features/admin/worker/wrapper/WorkerDetailsLayout')
);
const AdminWorkerAboutPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerAboutPage')
);
const AdminWorkerReviewsPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerReviewsPage')
);
const AdminWorkerQuotesPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerQuotesPage')
);
const AdminWorkerPaymentsPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerPaymentsPage')
);
const AdminWorkerDisputesPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerDisputesPage')
);
const AdminWorkerBookingsPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerBookingsPage')
);

const CategoryManagementPage = lazy(
  () => import('@/features/admin/service/pages/CategoryManagementPage')
);
const AdminChatPage = lazy(() => import('@/features/admin/chat/pages/AdminChatPage'));
const AdminDisputesPage = lazy(() => import('@/features/dispute/pages/AdminDisputesPage'));
const HomePageLayout = lazy(() => import('@/features/admin/home/layout/HomeLayout'));

const HomeSectionPage = lazy(() => import('@/features/admin/home/pages/HomeSectionPage'));
const HomeLayoutPage = lazy(() => import('@/features/admin/home/pages/HomeLayoutPage'));
const AdminReviewsPage = lazy(() => import('@/features/review/pages/AdminReviewsPage'));
const AdminBookingPage = lazy(() => import('@/features/admin/booking/pages/AdminBookingPage'));
const AdminPaymentsPage = lazy(() => import('@/features/payments/pages/AdminPaymentsPage'));
const AdminBookingDetailsPage = lazy(
  () => import('@/features/admin/booking/pages/AdminBookingDetailsPage')
);
const AdminWorkerDocumentsPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerDocumentsPage')
);
const AdminWorkerServicesPage = lazy(
  () => import('@/features/admin/worker/pages/AdminWorkerServicesPage')
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
              <Route path=":userId" element={<UserDetailsLayout />}>
                <Route index element={<AdminUserOverviewPage />} />
                <Route path="bookings" element={<AdminUserBookingsPage />} />
                <Route path="reviews" element={<AdminUserReviewsPage />} />
                <Route path="quotes" element={<AdminUserQuotesPage />} />
                <Route path="disputes" element={<AdminUserDisputesPage />} />
                <Route path="payments" element={<AdminUserPaymentsPage />} />
              </Route>
            </Route>

            <Route path="workers">
              <Route index element={<AdminWorkerManagementPage />} />
              <Route path=":workerId" element={<WorkerDetailsLayout />}>
                <Route index element={<AdminWorkerAboutPage />} />
                <Route path="documents" element={<AdminWorkerDocumentsPage />} />
                <Route path="services" element={<AdminWorkerServicesPage />} />
                <Route path="bookings" element={<AdminWorkerBookingsPage />} />
                <Route path="reviews" element={<AdminWorkerReviewsPage />} />
                <Route path="quotes" element={<AdminWorkerQuotesPage />} />
                <Route path="disputes" element={<AdminWorkerDisputesPage />} />
                <Route path="payments" element={<AdminWorkerPaymentsPage />} />
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
