import { motion } from 'framer-motion';
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import ErrorState from '@/components/molecules/ErrorState';
import WorkerProfileHeader from '@/components/organisms/WorkerProfileHeader';
import { useGetOrCreateChat } from '@/features/chat/hooks/useChats';
import { useWorkerProfile } from '@/features/profile/hooks/useWorkerProfile';
import WorkerProfileLayoutSkeleton from '@/features/worker/profile/components/WorkeAboutSkeleton';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';

const TABS = [
  { name: 'About', path: '' },
  { name: 'Services', path: 'services' },
  { name: 'Reviews', path: 'reviews' },
];

export default function WorkerProfileRouteLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workerId } = useParams();
  const { isAuthenticated } = useAppSelector(s => s.auth);
  const { data, isLoading, error, isError, refetch } = useWorkerProfile(workerId);
  const { mutateAsync: createChat, isPending } = useGetOrCreateChat();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-5 py-3 text-sm font-medium transition-all duration-150 border-b-2 whitespace-nowrap',
      isActive
        ? 'text-foreground font-semibold border-foreground'
        : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40'
    );

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: `${location.pathname}${location.search}${location.hash}` },
      });
      return;
    }
    const res = await createChat({ participantId: workerId! });
    navigate(`/messages/${res.id}`);
  };

  return (
    <main className="space-y-6 md:-mx-7 -mt-6">
      {isLoading ? (
        <WorkerProfileLayoutSkeleton />
      ) : isError ? (
        <ErrorState description={error.message} onRetry={refetch} />
      ) : (
        <>
          {data && (
            <WorkerProfileHeader
              worker={data}
              isChatLoading={isPending}
              onStartChat={handleStartChat}
            />
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
            <div className="flex border-b border-border overflow-x-auto no-scrollbar mb-6">
              {TABS.map(tab => (
                <NavLink
                  key={tab.name}
                  to={tab.path}
                  end={tab.path === ''}
                  className={getNavLinkClass}
                >
                  {tab.name}
                </NavLink>
              ))}
            </div>

            <motion.div
              key={workerId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet context={{ worker: data }} />
            </motion.div>
          </div>
        </>
      )}
    </main>
  );
}
