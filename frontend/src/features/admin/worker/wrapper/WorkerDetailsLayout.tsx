import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { Award, Ban, Calendar, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import z from 'zod';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { AppModal } from '@/components/molecules/AppModal';
import PageHeader from '@/components/molecules/PageHeader';
import ProfileImage from '@/components/molecules/ProfileImage';
import ProfileImageModal from '@/components/molecules/ProfileImageModal';
import { Badge } from '@/components/ui/badge';
import { ACTIVE_WORKER_STATUSES, WORKER_STATUS, WORKER_STATUS_CONFIG } from '@/constants';
import { useWorkerProfileDetails } from '@/features/user/worker/hooks/useWorkerProfile';
import WorkerProfileLayoutSkeleton from '@/features/worker/profile/components/WorkerProfileLayoutSkeleton';
import { createDescriptionRule } from '@/lib/validation/rules';
import PageError from '@/pages/PageError';
import { handleApiError } from '@/utils/handleApiError';

import WorkerApplicationReview from '../components/WorkerApplicationReview';
import WorkerOverview from '../components/WorkerOverview';
import { useWorkerStatusToggle } from '../hooks/useWorker';

const suspendSchema = z.object({
  reason: createDescriptionRule('Reason', true),
});
type SuspendSchemaType = z.infer<typeof suspendSchema>;

export default function WorkerDetailsLayout() {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const { workerId } = useParams();
  const { state } = useLocation();
  const { data, isLoading, error, isError } = useWorkerProfileDetails(workerId);
  const { mutateAsync: updateStatus, isPending } = useWorkerStatusToggle();
  const {
    phone,
    status,
    coverImage,
    displayName,
    tagline,
    profileImage,
    location,
    experience,
    createdAt,
  } = data ?? {};
  const email = state?.email;
  const isVerified = status === WORKER_STATUS.VERIFIED;
  const isSuspended = status === WORKER_STATUS.SUSPENDED;
  const isActiveWorker = status ? ACTIVE_WORKER_STATUSES.includes(status) : false;
  const config = WORKER_STATUS_CONFIG[status!];
  const Icon = config?.icon;

  const handleStatusUpdate = async (data: SuspendSchemaType) => {
    if (!workerId) {
      return;
    }

    try {
      const res = await updateStatus({
        workerId,
        reason: data.reason,
      });
      setIsStatusModalOpen(false);
      reset();
      toast.success(res.message);
    } catch (error) {
      toast.error(handleApiError(error));
      console.error(error);
    }
  };

  const { handleSubmit, reset, formState, register } = useForm<SuspendSchemaType>({
    resolver: zodResolver(suspendSchema),
    defaultValues: { reason: '' },
  });

  return (
    <main className="p-4 lg:p-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex items-start justify-between gap-3">
          <PageHeader
            title="Worker Details"
            description={`Review verification, bookings, and earnings for ${displayName}.`}
          />
          {(isVerified || isSuspended) && (
            <Button
              variant={isVerified ? 'red' : 'green'}
              size="md"
              onClick={() => setIsStatusModalOpen(true)}
              iconLeft={isVerified ? <Ban /> : <ShieldCheck />}
            >
              {isVerified ? 'Block User' : 'Unblock User'}
            </Button>
          )}
        </div>
        {isLoading ? (
          <WorkerProfileLayoutSkeleton />
        ) : isError ? (
          <PageError title={error.message} />
        ) : (
          <>
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-xl border bg-card"
            >
              <div
                className="h-48 w-full bg-muted sm:h-60"
                style={{
                  backgroundImage: coverImage ? `url(${coverImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/10 via-transparent to-background sm:h-60" />
              <div className="relative mx-auto max-w-7xl px-4 sm:px-8">
                <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between pb-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <ProfileImage
                      src={profileImage}
                      name={displayName}
                      shape="rounded"
                      size={120}
                      onClickImage={() => setOpenImage(true)}
                      className="!w-24 !h-24 sm:!w-28 sm:!h-28"
                    />
                    <div className="space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight sm:text-3xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] truncate max-w-[200px] sm:max-w-none">
                          {displayName}
                        </h1>
                        <Badge variant={config.badgeVariant}>
                          <Icon className="size-3" />
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground sm:text-base">{tagline}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {location?.addressLabel}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5" />
                          {experience} yrs experience
                        </span>
                        <span className="inline-flex items-center gap-1.5 truncate max-w-[160px] sm:max-w-none">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{email}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {phone}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Applied {dayjs(createdAt).format('MMM DD, YYYY')};
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
            {isActiveWorker ? (
              <WorkerOverview worker={data!} key={data?.id} />
            ) : (
              <WorkerApplicationReview key={data?.id} worker={data!} />
            )}
          </>
        )}
        <AppModal
          open={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            reset();
          }}
          title={isVerified ? 'Block Worker' : 'Unblock Worker'}
          description={
            isVerified
              ? 'This worker will be suspended and removed from the platform immediately.'
              : 'This worker will be restored and can resume accepting bookings.'
          }
          isDescriptionHidden={false}
          canCloseOnOutsideClick={!isPending}
          cancelText="Cancel"
          confirmText={isVerified ? 'Block Worker' : 'Unblock Worker'}
          buttonVariant={isVerified ? 'red' : 'green'}
          onConfirm={
            isVerified ? handleSubmit(handleStatusUpdate) : () => handleStatusUpdate({ reason: '' })
          }
          isConfirmLoading={isPending}
        >
          {isVerified ? (
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Reason for suspension <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  {...register('reason')}
                  error={formState.errors.reason?.message}
                  placeholder="Briefly explain why this account is being blocked."
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 mt-2 text-sm text-emerald-800 dark:text-emerald-200">
              <strong>{displayName}</strong> will be restored as a verified worker.
            </div>
          )}
        </AppModal>
      </div>
      <ProfileImageModal open={openImage} onOpenChange={setOpenImage} image={data?.profileImage} />
    </main>
  );
}
