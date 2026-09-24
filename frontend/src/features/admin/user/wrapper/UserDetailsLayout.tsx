import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import {
  Ban,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';

import Button from '@/components/atoms/Button';
import PageHeader from '@/components/molecules/PageHeader';
import ProfileImage from '@/components/molecules/ProfileImage';
import ProfileImageModal from '@/components/molecules/ProfileImageModal';
import StatCard from '@/components/molecules/StatCard';
import StatusChangeModal from '@/components/molecules/StatusChangeModal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSocket } from '@/context/socket/use-socket';
import { cn } from '@/lib/utils';
import PageError from '@/pages/PageError';
import { formatCurrency } from '@/utils/currency';
import { formatLastSeen } from '@/utils/time.format';

import { useAdminUserDetails, useAdminUserStats } from '../hooks/useAdminUserDetails';
import { useToggleUserStatus } from '../hooks/useToggleUserStatus';

const TABS = [
  { name: 'About', path: '' },
  { name: 'Bookings', path: 'bookings' },
  { name: 'Reviews', path: 'reviews' },
  { name: 'Quotes', path: 'quotes' },
  { name: 'Disputes', path: 'disputes' },
  { name: 'Payments', path: 'payments' },
];

export default function UserDetailsLayout() {
  const [openImage, setOpenImage] = useState(false);
  const { userId } = useParams();
  const { data: user, isLoading, error, isError } = useAdminUserDetails(userId);
  const { onlineUsers, lastSeenMap } = useSocket();

  const { name, email, phone, role, profileImage, isBlocked, createdAt } = user ?? {};
  const { data: stats, isLoading: isStatsLoading } = useAdminUserStats(userId);

  const isOnline = userId ? onlineUsers.has(userId) : false;
  const lastSeen = userId ? lastSeenMap.get(userId) : null;

  const {
    isModalOpen: isStatusModalOpen,
    openModal: openStatusModal,
    closeModal: closeStatusModal,
    handleConfirm: handleToggleUserStatus,
    isPending,
  } = useToggleUserStatus();

  return (
    <main className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-start justify-between gap-3">
          <PageHeader
            title="User Details"
            description={`View account information, activity, and bookings for ${name ?? 'User'}.`}
          />
          {user && (
            <Button
              variant={isBlocked ? 'green' : 'red'}
              size="md"
              onClick={() => userId && openStatusModal(userId)}
              iconLeft={isBlocked ? <ShieldCheck /> : <Ban />}
            >
              {isBlocked ? 'Unblock User' : 'Block User'}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="h-48 w-full rounded-2xl bg-card border border-border animate-pulse p-6" />
        ) : isError ? (
          <PageError title={error?.message} />
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <ProfileImage
                    src={profileImage}
                    name={name}
                    shape="rounded"
                    size={100}
                    onClickImage={() => setOpenImage(true)}
                    className="w-20! h-20! sm:w-24! sm:h-24!"
                  />
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold tracking-tight sm:text-2xl truncate">
                        {name}
                      </h1>
                      <Badge variant={isBlocked ? 'destructive' : 'green'}>
                        {isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                      {/* Presence indicator */}
                      {isOnline ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </span>
                      ) : lastSeen ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                          Last seen {formatLastSeen(lastSeen)}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="truncate">{email}</span>
                      </span>
                      {phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          {phone}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 capitalize">
                        <User className="h-3.5 w-3.5 text-primary" />
                        {role}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Member since {dayjs(createdAt).format('MMM DD, YYYY')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 w-full max-w-7xl mx-auto mt-4">
              {isStatsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-27.5 sm:h-32.5 w-full rounded-xl border bg-card p-3 sm:p-5 flex items-center gap-3 sm:gap-4"
                  >
                    <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-[60%] sm:w-[50%]" />
                      <Skeleton className="h-5 w-[40%] sm:w-[30%]" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <StatCard
                    label="Total Bookings"
                    value={stats?.totalBookings}
                    icon={<Calendar className="h-4 w-4" />}
                    tone="info"
                  />
                  <StatCard
                    label="Total Spent"
                    value={formatCurrency(stats?.totalSpent)}
                    icon={<DollarSign className="h-4 w-4" />}
                    tone="success"
                  />
                  <StatCard
                    label="Support / Disputes"
                    value={stats?.totalDisputes}
                    icon={<ShieldAlert className="h-4 w-4" />}
                    tone="warning"
                  />
                </>
              )}
            </div>
            <div className="max-w-7xl mx-auto pb-16 mt-4">
              <div className="overflow-x-auto no-scrollbar border-b border-border mb-6">
                <div className="flex">
                  {TABS.map(tab => (
                    <NavLink
                      key={tab.name}
                      to={tab.path}
                      end={tab.path === ''}
                      className={({ isActive }) =>
                        cn(
                          'px-5 py-3 text-sm font-medium transition-all duration-150 border-b-2 whitespace-nowrap flex items-center gap-2',
                          isActive
                            ? 'text-foreground font-semibold border-foreground'
                            : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40'
                        )
                      }
                    >
                      {tab.name}
                    </NavLink>
                  ))}
                </div>
              </div>
              <motion.div
                key={user?.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet context={{ user }} />
              </motion.div>
            </div>
          </>
        )}
      </div>

      <StatusChangeModal
        open={isStatusModalOpen}
        onClose={closeStatusModal}
        onConfirm={handleToggleUserStatus}
        fromStatus={isBlocked ? 'Blocked' : 'Active'}
        toStatus={isBlocked ? 'Active' : 'Blocked'}
        loading={isPending}
        name={name}
      />
      <ProfileImageModal open={openImage} onOpenChange={setOpenImage} image={profileImage} />
    </main>
  );
}
