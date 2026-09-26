import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import { ROLE } from '@/constants';
import NotFound from '@/pages/NotFound';

import GuestRoute from './GuestRoute';
import ProtectedRoute from './ProtectedRoute';

const UserChatPage = lazy(() => import('@/features/user/chat/UserChatPage'));

// guest pages
const Login = lazy(() => import('@/features/auth/pages/Login'));
const Signup = lazy(() => import('@/features/auth/pages/Signup'));
const OtpPage = lazy(() => import('@/features/auth/pages/OtpPage'));
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPassword'));
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword'));
const GoogleCallback = lazy(() => import('@/features/auth/pages/GoogleCallback'));

const UserProfilePage = lazy(() => import('@/features/user/profile/pages/UserProfilePage'));
const RoleBasedRoot = lazy(() => import('./RoleBasedRoot'));
const JoinUsPage = lazy(() => import('@/pages/JoinUsPage'));
const UserLayout = lazy(() => import('@/layouts/user/UserLayout'));

const ServicePage = lazy(() => import('@/features/user/services/pages/ServicePage'));
const WorkerListingPage = lazy(() => import('@/features/user/services/pages/WorkerListingPage'));

const WorkerProfileRouteLayout = lazy(
  () => import('@/features/user/worker/WorkerProfileRouteLayout')
);
const WorkerProfilePage = lazy(() => import('@/features/user/worker/pages/WorkerProfilePage'));
const WorkerServicesPage = lazy(() => import('@/features/user/worker/pages/WorkerServicesPage'));
const WorkerPublicReviewsPage = lazy(
  () => import('@/features/review/pages/WorkerPublicReviewsPage.tsx')
);
const UserQuotesListPage = lazy(() => import('@/features/quote/pages/UserQuotesListPage'));

const UserBookingsPage = lazy(() => import('@/features/user/booking/pages/UserBookingsPage'));
const UserBookingDetailsPage = lazy(
  () => import('@/features/user/booking/pages/UserBookingDetailsPage')
);
const UserDisputesPage = lazy(() => import('@/features/dispute/pages/UserDisputesPage'));
const UserPaymentsPage = lazy(() => import('@/features/payments/pages/UserPaymentsPage'));

export default function UserRoutes() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<OtpPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
        </Route>

        <Route element={<UserLayout />}>
          <Route path="/" element={<RoleBasedRoot />} />
          <Route path="/join-us" element={<JoinUsPage />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/services/:serviceId" element={<WorkerListingPage />} />
          <Route element={<ProtectedRoute requiredRoles={[ROLE.USER, ROLE.WORKER]} />}>
            <Route path="messages">
              <Route index element={<UserChatPage />} />
              <Route path=":chatId" element={<UserChatPage />} />
            </Route>
            <Route path="/bookings" element={<UserBookingsPage />} />
            <Route path="/bookings/:bookingId" element={<UserBookingDetailsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/disputes" element={<UserDisputesPage />} />
            <Route path="/payments" element={<UserPaymentsPage />} />
            <Route path="/quotes" element={<UserQuotesListPage />} />
          </Route>
          <Route path="/workers/:workerId" element={<WorkerProfileRouteLayout />}>
            <Route index element={<WorkerProfilePage />} />
            <Route path="services" element={<WorkerServicesPage />} />
            <Route path="reviews" element={<WorkerPublicReviewsPage />} />
          </Route>
          <Route path="not-found" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
