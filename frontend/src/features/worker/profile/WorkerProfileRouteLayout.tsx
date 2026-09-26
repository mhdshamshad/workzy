import { motion } from 'framer-motion';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import ProfileImage from '@/components/molecules/ProfileImage';
import ProfileImageModal from '@/components/molecules/ProfileImageModal';
import WorkerProfileHeader from '@/components/organisms/WorkerProfileHeader';
import { useWorkerProfile } from '@/features/profile/hooks/useWorkerProfile';
import { cn } from '@/lib/utils';
import PageError from '@/pages/PageError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';

import WorkerProfileLayoutSkeleton from './components/WorkerProfileLayoutSkeleton';
import { useWorkerProfileImageUpload } from './hooks/useWorkerProfile';

const TABS = [
  { name: 'About', path: '' },
  { name: 'Documents', path: 'documents' },
  { name: 'Account', path: 'account' },
  { name: 'Leaves', path: 'leaves' },
];

const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'px-5 py-3 text-sm font-medium transition-all duration-150 border-b-2 whitespace-nowrap',
    isActive
      ? 'text-foreground font-semibold border-foreground'
      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40'
  );

export default function WorkerProfileRouteWrapper() {
  const [openImage, setOpenImage] = useState(false);
  const { user } = useAppSelector((s: RootState) => s.auth);
  const dispatch = useAppDispatch();

  const { data, isLoading, isError, refetch, error } = useWorkerProfile(user?.worker?.id);

  const { imageUploading, progress, uploadImage } = useWorkerProfileImageUpload();

  async function handleImageUpload(file: File) {
    const url = await uploadImage(file);
    if (url) {
      dispatch(
        updateUser({
          worker: {
            ...(user?.worker ?? {}),
            profileImage: url,
          },
        })
      );
    }
  }
  return (
    <main>
      {isLoading ? (
        <WorkerProfileLayoutSkeleton />
      ) : isError ? (
        <PageError fullScreen={false} description={error?.message} onRetry={() => refetch()} />
      ) : (
        <>
          {data && (
            <WorkerProfileHeader
              worker={data}
              workerAction={
                <ProfileImage
                  src={user?.worker?.profileImage}
                  name={data.displayName}
                  onClickImage={() => setOpenImage(true)}
                  shape="rounded"
                  size={120}
                  onChange={handleImageUpload}
                  loading={imageUploading}
                  className="w-24! h-24! sm:w-28! sm:h-28!"
                  editable
                  progress={progress}
                />
              }
              type="worker"
            />
          )}
          <div className="px-4 sm:px-6 pb-16">
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
              key={user?.worker?.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet context={{ reloadWorkerData: refetch }} />
            </motion.div>
          </div>
        </>
      )}
      <ProfileImageModal open={openImage} onOpenChange={setOpenImage} image={data?.profileImage} />
    </main>
  );
}
