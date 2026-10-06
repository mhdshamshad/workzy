import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ROLE } from '@/constants';

import ProtectedRoute from './ProtectedRoute';

const WorkerWalletLayout = lazy(() => import('@/features/wallet/pages/worker/WorkerWalletLayout'));
const WalletTransactionsPage = lazy(
  () => import('@/features/wallet/pages/worker/WalletTransactionsPage')
);
const WalletPayoutsPage = lazy(() => import('@/features/wallet/pages/worker/WalletPayoutsPage'));

const WorkerChatPage = lazy(() => import('@/features/worker/chat/pages/WorkerChatPage'));
const WorkerPaymentsPage = lazy(() => import('@/features/payments/pages/WorkerPaymentsPage'));
const WorkerLayout = lazy(() => import('@/layouts/worker/WorkerLayout'));
const WorkerDisputesPage = lazy(() => import('@/features/dispute/pages/WorkerDisputesPage'));
const WorkerQuoteCreatePage = lazy(() => import('@/features/quote/pages/WorkerQuoteCreatePage'));
const WorkerQuotesListPage = lazy(() => import('@/features/quote/pages/WorkerQuotesListPage'));

const WorkerDashboard = lazy(() => import('@/features/worker/dashboard/pages/WorkerDashboard'));
const WorkerOwnReviewsPage = lazy(() => import('@/features/review/pages/WorkerOwnReviewsPage'));
const WorkerServicesPage = lazy(
  () => import('@/features/worker/services/pages/WorkerServicesPage')
);
const WorkerProfileRouteLayout = lazy(
  () => import('@/features/worker/profile/WorkerProfileRouteLayout')
);
const WorkerAboutContentPage = lazy(
  () => import('@/features/worker/profile/pages/AboutContentPage')
);
const WorkerDocumentsContentPage = lazy(
  () => import('@/features/worker/profile/pages/DocumentsContentPage')
);
const AccountPage = lazy(() => import('@/features/worker/profile/pages/AccountPage'));

const WorkerBookingDetailsPage = lazy(
  () => import('@/features/worker/booking/pages/WorkerBookingDetailsPage')
);
const WorkerBookingsPage = lazy(() => import('@/features/worker/booking/pages/WorkerBookingsPage'));
const WorkerLeaveManagement = lazy(
  () => import('@/features/worker/profile/pages/WorkerLeaveManagement')
);

export default function WorkerRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute requiredRoles={[ROLE.WORKER]} />}>
        <Route element={<WorkerLayout />}>
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="reviews" element={<WorkerOwnReviewsPage />} />
          <Route path="services" element={<WorkerServicesPage />} />
          <Route path="payments" element={<WorkerPaymentsPage />} />
          <Route path="bookings" element={<WorkerBookingsPage />} />
          <Route path="bookings/:bookingId" element={<WorkerBookingDetailsPage />} />
          <Route path="quotes" element={<WorkerQuotesListPage />} />
          <Route path="quotes/:bookingId" element={<WorkerQuoteCreatePage />} />
          <Route path="messages">
            <Route index element={<WorkerChatPage />} />
            <Route path=":chatId" element={<WorkerChatPage />} />
          </Route>
          <Route path="disputes" element={<WorkerDisputesPage />} />
          <Route path="profile" element={<WorkerProfileRouteLayout />}>
            <Route index element={<WorkerAboutContentPage />} />
            <Route path="documents" element={<WorkerDocumentsContentPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="leaves" element={<WorkerLeaveManagement />} />
          </Route>
          <Route path="wallet" element={<WorkerWalletLayout />}>
            <Route index element={<Navigate to="transactions" />} />
            <Route path="transactions" element={<WalletTransactionsPage />} />
            <Route path="payouts" element={<WalletPayoutsPage />} />
            <Route path="payments" element={<WorkerPaymentsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
