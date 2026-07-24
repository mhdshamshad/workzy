import { motion } from 'framer-motion';
import { Award, BadgeCheck, Calendar, IndianRupee, TrendingUp, Wallet } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import StatCard from '@/components/molecules/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { DOCUMENT_STATUS } from '@/constants';
import { useWorkerStats } from '@/features/admin/worker/hooks/useWorkerStats';
import { cn } from '@/lib/utils';
import type { WorkerProfileDetails } from '@/types/worker';

const TABS = [
  { name: 'About', path: '' },
  { name: 'Documents', path: 'documents' },
  { name: 'Services', path: 'services' },
  { name: 'Bookings', path: 'bookings' },
  { name: 'Reviews', path: 'reviews' },
  { name: 'Quotes', path: 'quotes' },
  { name: 'Disputes', path: 'disputes' },
  { name: 'Payments', path: 'payments' },
];

interface WorkerOverviewProps {
  worker: WorkerProfileDetails;
}

export default function WorkerOverview({ worker }: WorkerOverviewProps) {
  const { data: stats, isLoading: isStatsLoading } = useWorkerStats(worker.id);

  const {
    completedBookings,
    completionRate = 0,
    grossRevenue,
    platformRevenue,
    rating = 0,
    totalBookings,
    totalReviews,
    upcomingBookings,
    workerEarnings,
  } = stats ?? {};

  const pendingDocumentsCount =
    worker.documents?.filter(
      doc => doc.status === DOCUMENT_STATUS.PENDING || doc.status === DOCUMENT_STATUS.IN_REVIEW
    ).length ?? 0;

  return (
    <>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 w-full max-w-7xl mx-auto mt-4">
        {isStatsLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-[110px] sm:h-[130px] w-full rounded-xl border bg-card p-3 sm:p-5 flex items-center gap-3 sm:gap-4"
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
              value={totalBookings}
              icon={<Calendar className="h-4 w-4" />}
              tone="info"
            />
            <StatCard
              label="Completed Jobs"
              value={completedBookings}
              icon={<BadgeCheck className="h-4 w-4" />}
              tone="success"
            />
            <StatCard
              label="Upcoming Jobs"
              value={upcomingBookings}
              icon={<Calendar className="h-4 w-4" />}
              tone="warning"
            />
            <StatCard
              label="Completion Rate"
              value={`${completionRate}%`}
              icon={<BadgeCheck className="h-4 w-4" />}
              tone={completionRate > 80 ? 'success' : completionRate > 50 ? 'warning' : 'error'}
            />
            <StatCard
              label="Rating"
              value={rating}
              sub={`${totalReviews ?? 0} Reviews`}
              icon={<Award className="h-4 w-4" />}
              tone={rating >= 4 ? 'success' : rating >= 3 ? 'warning' : 'error'}
            />
            <StatCard
              label="Gross Revenue"
              value={`₹${grossRevenue ?? 0}`}
              icon={<IndianRupee className="h-4 w-4" />}
              tone="neutral"
            />
            <StatCard
              label="Total Earnings"
              value={`₹${workerEarnings ?? 0}`}
              icon={<Wallet className="h-4 w-4" />}
              tone="primary"
            />
            <StatCard
              label="Platform Revenue"
              value={`₹${platformRevenue ?? 0}`}
              icon={<TrendingUp className="h-4 w-4" />}
              tone="success"
            />
          </>
        )}
      </section>

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
                {tab.name === 'Documents' && pendingDocumentsCount > 0 && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {pendingDocumentsCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
        <motion.div
          key={worker.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Outlet context={{ worker }} />
        </motion.div>
      </div>
    </>
  );
}
