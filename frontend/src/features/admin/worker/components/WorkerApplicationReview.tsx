import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import {
  CheckCircle2,
  RefreshCcw,
  XCircle,
  ExternalLink,
  Check,
  X,
  AlertTriangle,
  Mail,
  Calendar,
  MapPin,
  Award,
  Clock,
  Briefcase,
  ClipboardCheck,
  ArrowLeft,
  Globe,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { Badge } from '@/components/ui/badge';
import {
  DOCUMENT_STATUS,
  WORKER_STATUS,
  WORKER_STATUS_CONFIG,
  type DocumentStatus,
} from '@/constants';
import { cn } from '@/lib/utils';
import type { WorkerProfileDetails } from '@/types/worker';
import { handleApiError } from '@/utils/handleApiError';

import { useReviewWorker } from '../hooks/useReviewWorker';
import { getDocInfo } from '../utils/documentUtils';
import { workerReviewSchema, type WorkerReviewFormType } from '../validation/workerReviewSchema';

type UpdatableDocumentStatus = Exclude<DocumentStatus, typeof DOCUMENT_STATUS.PENDING>;

export default function WorkerApplicationReview({ worker }: { worker: WorkerProfileDetails }) {
  const { mutateAsync: reviewWorker, isPending } = useReviewWorker();

  const [mode, setMode] = useState<'preview' | 'review'>('preview');

  const {
    handleSubmit,
    reset,
    formState: { errors },
    register,
    control,
    setValue,
    watch,
  } = useForm<WorkerReviewFormType>({
    resolver: zodResolver(workerReviewSchema),
    defaultValues: {
      documents: [],
      rejectReason: '',
      status: WORKER_STATUS.IN_REVIEW,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { fields } = useFieldArray({
    control,
    name: 'documents',
  });

  useEffect(() => {
    reset({
      documents: worker.documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        status: doc.status === DOCUMENT_STATUS.PENDING ? DOCUMENT_STATUS.IN_REVIEW : doc.status,
        rejectReason: doc.rejectReason ?? '',
      })),
      rejectReason: worker.rejectReason ?? '',
      status:
        worker.status === WORKER_STATUS.PENDING || worker.status === WORKER_STATUS.SUSPENDED
          ? WORKER_STATUS.IN_REVIEW
          : worker.status,
    });
  }, [reset, worker]);

  const docsWatch = watch('documents');
  const selectedStatus = watch('status');

  const hasInReviewDoc = docsWatch?.some(d => d.status === DOCUMENT_STATUS.IN_REVIEW);
  const hasRejectedDoc = docsWatch?.some(d => d.status === DOCUMENT_STATUS.REJECTED);
  const allVerified =
    docsWatch?.length > 0 && docsWatch.every(d => d.status === DOCUMENT_STATUS.VERIFIED);
  const reviewedCount = docsWatch?.filter(d => d.status !== DOCUMENT_STATUS.IN_REVIEW).length ?? 0;

  useEffect(() => {
    if (!docsWatch?.length) {
      return;
    }

    if (hasInReviewDoc && selectedStatus !== WORKER_STATUS.IN_REVIEW) {
      setValue('status', WORKER_STATUS.IN_REVIEW, { shouldDirty: true, shouldValidate: true });
      setValue('rejectReason', '', { shouldDirty: true, shouldValidate: true });
      return;
    }

    if (!hasInReviewDoc) {
      if (allVerified) {
        setValue('rejectReason', '', { shouldDirty: true, shouldValidate: true });
        setValue('status', WORKER_STATUS.VERIFIED, { shouldDirty: true, shouldValidate: true });
        return;
      }
      if (
        hasRejectedDoc &&
        (selectedStatus === WORKER_STATUS.IN_REVIEW || selectedStatus === WORKER_STATUS.VERIFIED)
      ) {
        setValue('status', WORKER_STATUS.NEEDS_REVISION, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }, [docsWatch, hasInReviewDoc, hasRejectedDoc, allVerified, selectedStatus, setValue]);

  const setDocStatus = (index: number, status: UpdatableDocumentStatus) => {
    setValue(`documents.${index}.status`, status, { shouldValidate: true, shouldDirty: true });
    if (status !== DOCUMENT_STATUS.REJECTED) {
      setValue(`documents.${index}.rejectReason`, undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (data: WorkerReviewFormType) => {
    try {
      const res = await reviewWorker({
        workerId: worker.id,
        data,
      });
      toast.success(res?.message);
      setMode('preview');
      reset();
    } catch (error) {
      toast.error(handleApiError(error));
      console.error(error);
    }
  };

  const config = WORKER_STATUS_CONFIG[worker.status] ?? WORKER_STATUS_CONFIG[WORKER_STATUS.PENDING];
  const StatusIcon = config.icon;

  const isReviewing = mode === 'review';

  return (
    <div className="mt-6 space-y-6">
      <div
        className={cn(
          'rounded-xl border p-4 shadow-sm flex flex-wrap items-center justify-between gap-3',
          config.bannerClass
        )}
      >
        <div className="flex gap-3">
          <StatusIcon className={cn('h-5 w-5 mt-0.5 shrink-0', config.iconClass)} />
          <div>
            <h4 className="font-semibold text-sm">{config.label}</h4>
            <p className="text-xs mt-1">
              {worker.status === WORKER_STATUS.REJECTED ||
              worker.status === WORKER_STATUS.NEEDS_REVISION
                ? worker.rejectReason
                : config.description}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant={isReviewing ? 'outline' : 'primary'}
          onClick={() => setMode(isReviewing ? 'preview' : 'review')}
          iconLeft={
            isReviewing ? <ArrowLeft className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />
          }
        >
          {isReviewing ? 'Back to Preview' : 'Start Review'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              About the Applicant
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground bg-muted/40 p-4 rounded-xl border border-border/40 italic">
              {worker?.about}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Verification Checklist
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isReviewing
                    ? 'Select a status for each document — you can change your mind at any time.'
                    : 'Uploaded documents at a glance. Start a review to update their status.'}
                </p>
              </div>
              <Badge variant="blue">
                {reviewedCount}/{fields.length} Reviewed
              </Badge>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const originalDoc = worker.documents[index];
                if (!originalDoc) {
                  return null;
                }

                const docInfo = getDocInfo(originalDoc.type);
                const DocIcon = docInfo.icon;
                const formDocStatus = watch(`documents.${index}.status`);
                const isApproved = formDocStatus === DOCUMENT_STATUS.VERIFIED;
                const isRejected = formDocStatus === DOCUMENT_STATUS.REJECTED;
                const isInReview = formDocStatus === DOCUMENT_STATUS.IN_REVIEW;

                return (
                  <div
                    key={field.id}
                    className={cn(
                      'flex flex-col md:flex-row gap-4 p-4 rounded-xl border transition-colors duration-200',
                      isApproved && 'bg-emerald-500/15 border-emerald-500/30',
                      isRejected && 'bg-red-500/15 border-red-500/30',
                      isInReview && 'bg-amber-500/15 border-amber-500/30'
                    )}
                  >
                    <div className="relative group overflow-hidden rounded-xl border border-border w-full md:w-36 h-36 bg-muted shrink-0 flex items-center justify-center shadow-inner">
                      {originalDoc.url ? (
                        <>
                          <img
                            src={originalDoc.url}
                            alt={docInfo.label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                            <a
                              href={originalDoc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-background/90 text-foreground hover:bg-background rounded-full shadow-lg transition-transform duration-300 transform scale-90 group-hover:scale-100 hover:scale-105 flex items-center justify-center"
                              id={`view-doc-${originalDoc.id}`}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-2 text-muted-foreground text-xs italic">
                          No document uploaded
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                                <DocIcon className="h-4 w-4" />
                              </span>
                              <h3 className="font-semibold text-base text-foreground">
                                {docInfo.label}
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              Uploaded on {dayjs(originalDoc.uploadedAt).format('MMM DD, YYYY')}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <Badge variant={isApproved ? 'green' : isRejected ? 'red' : 'amber'}>
                              {isApproved ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : isRejected ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {isApproved ? 'Verified' : isRejected ? 'Rejected' : 'Pending Review'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {!isReviewing && isRejected && (
                        <div className="mt-4 pt-3 border-t border-border/60">
                          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-rose-500" />
                            Rejection Reason
                          </p>
                          <p className="text-xs text-foreground mt-1 bg-rose-500/10 border border-rose-500/20 rounded-lg px-2.5 py-2">
                            {docsWatch?.[index]?.rejectReason || 'No reason provided.'}
                          </p>
                        </div>
                      )}

                      {isReviewing && (
                        <div className="mt-4 pt-3 border-t border-border/60">
                          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 gap-0.5">
                            <Button
                              size="xs"
                              type="button"
                              onClick={() => setDocStatus(index, 'in_review')}
                              variant={isInReview ? 'warning' : 'ghost'}
                              iconLeft={<RefreshCcw className="h-3.5 w-3.5" />}
                              id={`in-review-${originalDoc.id}`}
                            >
                              In Review
                            </Button>
                            <Button
                              size="xs"
                              type="button"
                              onClick={() => setDocStatus(index, 'verified')}
                              variant={isApproved ? 'green' : 'ghost'}
                              iconLeft={<Check className="h-3.5 w-3.5" />}
                              id={`approve-${originalDoc.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              type="button"
                              onClick={() => setDocStatus(index, 'rejected')}
                              variant={isRejected ? 'red' : 'ghost'}
                              iconLeft={<X className="h-3.5 w-3.5" />}
                              id={`reject-${originalDoc.id}`}
                            >
                              Reject
                            </Button>
                          </div>

                          {isRejected && (
                            <div className="mt-3 space-y-1">
                              <Label className="text-[12px] flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-rose-500" />
                                Rejection Reason *
                              </Label>
                              <Textarea
                                {...register(`documents.${index}.rejectReason`, {
                                  setValueAs: v => (v === '' ? undefined : v),
                                })}
                                placeholder="Describe why this document is rejected..."
                                error={errors.documents?.[index]?.rejectReason?.message}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {errors.documents && (
              <p className="text-sm text-rose-500 font-semibold mt-4">{errors.documents.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-foreground">Contact Details</h3>

            <div className="space-y-3 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                </span>
                <span className="truncate">{worker.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                </span>
                <span>{worker.location?.addressLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Award className="h-4 w-4 shrink-0" />
                </span>
                <span>{worker.experience} Years Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-muted text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                </span>
                <span>Applied {dayjs(worker.createdAt).format('MMM DD, YYYY')}</span>
              </div>
              {worker?.languages?.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                    <Globe className="h-4 w-4 shrink-0" />
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {worker.languages.map(lang => (
                      <span
                        key={lang}
                        className="rounded-full border border-section-blue-border bg-section-blue px-2.5 py-0.5 text-xs font-medium text-section-blue-text"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isReviewing ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 lg:sticky lg:top-6">
              <h3 className="font-bold text-lg text-foreground">Review Verdict</h3>

              {hasInReviewDoc && (
                <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 border border-border/40">
                  Finish reviewing every document to unlock a final verdict.
                </p>
              )}

              <div className="space-y-3">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Overall Status
                </label>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    type="button"
                    onClick={() =>
                      setValue('status', WORKER_STATUS.VERIFIED, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={!allVerified}
                    variant={selectedStatus === WORKER_STATUS.VERIFIED ? 'green' : 'ghost'}
                    id="verdict-verify"
                    className="w-full justify-start"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Worker
                  </Button>
                  <Button
                    type="button"
                    className="w-full justify-start"
                    onClick={() =>
                      setValue('status', WORKER_STATUS.IN_REVIEW, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={!hasInReviewDoc}
                    variant={selectedStatus === WORKER_STATUS.IN_REVIEW ? 'blue' : 'ghost'}
                    id="verdict-in-review"
                  >
                    <Clock className="h-4 w-4" />
                    Keep Under Review
                  </Button>
                  <Button
                    type="button"
                    className="w-full justify-start"
                    onClick={() =>
                      setValue('status', WORKER_STATUS.NEEDS_REVISION, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={hasInReviewDoc}
                    variant={selectedStatus === WORKER_STATUS.NEEDS_REVISION ? 'warning' : 'ghost'}
                    id="verdict-revision"
                    iconLeft={<RefreshCcw className="h-4 w-4" />}
                  >
                    Request Revision
                  </Button>
                  <Button
                    type="button"
                    className="w-full justify-start"
                    onClick={() =>
                      setValue('status', WORKER_STATUS.REJECTED, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    disabled={hasInReviewDoc}
                    variant={selectedStatus === WORKER_STATUS.REJECTED ? 'red' : 'ghost'}
                    id="verdict-reject"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Application
                  </Button>
                </div>
              </div>

              {(selectedStatus === WORKER_STATUS.NEEDS_REVISION ||
                selectedStatus === WORKER_STATUS.REJECTED) && (
                <div className="space-y-1.5 pt-2">
                  <Label className="text-[12px] flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-rose-500" />
                    Rejection/Revision Reason *
                  </Label>
                  <Textarea
                    {...register('rejectReason')}
                    placeholder="Enter detailed feedback or reasons for the applicant..."
                    error={errors.rejectReason?.message}
                  />
                </div>
              )}

              {errors.status && (
                <p className="text-xs text-rose-500 font-semibold mt-2">{errors.status.message}</p>
              )}

              <Button
                type="submit"
                fullWidth
                loading={isPending}
                className="mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
                id="submit-review-btn"
              >
                Submit Review
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center space-y-3">
              <ClipboardCheck className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Review the applicant's details and documents on the left, then start a review to
                approve, reject, or request revisions.
              </p>
              <Button type="button" onClick={() => setMode('review')} fullWidth>
                Start Review
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
