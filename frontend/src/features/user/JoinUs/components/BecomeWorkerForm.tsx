import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock,
  FileEdit,
  Globe,
  MapPin,
  Pencil,
  ShieldCheck,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { ImageUpload } from '@/components/molecules/ImageUpload';
import MultiSelectInput from '@/components/molecules/MultiSelectInput';
import ProfileImage from '@/components/molecules/ProfileImage';
import { DOCUMENT_TYPE, INDIAN_LANGUAGES, WORKER_STATUS, type DocumentType } from '@/constants';
import { UploadPurposes } from '@/constants/upload';
import MapSelector from '@/features/profile/components/MapSelector';
import { useImageUpload } from '@/features/profile/hooks/useImageUpload';
import { cn } from '@/lib/utils';
import type { WorkerProfileDetails } from '@/types/worker';

import { JoinWorkerSchema, type JoinWorkerSchemaType } from '../validation/JoinWorkerFormSchema';

interface BecomeWorkerFormType {
  onSubmit: (data: JoinWorkerSchemaType) => void;
  worker?: WorkerProfileDetails;
  isLoading?: boolean;
  userPhone?: string;
}

const STEPS = [
  { key: 'details', label: 'Your Details', icon: 'badge' },
  { key: 'documents', label: 'Documents', icon: 'verified_user' },
] as const;

type DocKey = 'aadhaar' | 'pan' | 'selfie' | 'profile';

const DOC_KEY_TO_TYPE: Record<DocKey, DocumentType> = {
  aadhaar: DOCUMENT_TYPE.AADHAAR,
  pan: DOCUMENT_TYPE.PAN,
  selfie: DOCUMENT_TYPE.SELFIE_VERIFICATION,
  profile: DOCUMENT_TYPE.PROFILE_PHOTO,
};

const DOC_LABELS: Record<DocKey, string> = {
  aadhaar: 'Aadhaar',
  pan: 'PAN Card',
  selfie: 'Selfie Verification',
  profile: 'Profile Photo',
};

const DOC_KEYS = Object.keys(DOC_KEY_TO_TYPE) as DocKey[];

function isDocKey(field: string): field is DocKey {
  return (DOC_KEYS as string[]).includes(field);
}

const defaultValues: JoinWorkerSchemaType = {
  displayName: '',
  about: '',
  tagline: '',
  experience: 0,
  profileImage: '',
  phone: '',
  location: { addressLabel: '', coordinates: [0, 0], type: 'Point' },
  documents: { aadhaar: '', pan: '', selfie: '', profile: '' },
  languages: [],
};

export default function BecomeWorkerForm({
  onSubmit,
  worker,
  isLoading,
  userPhone,
}: BecomeWorkerFormType) {
  const status = worker?.status;
  const isNew = !worker;
  const isPendingDraft = status === WORKER_STATUS.PENDING;
  const isInReview = status === WORKER_STATUS.IN_REVIEW;
  const isRevision = status === WORKER_STATUS.NEEDS_REVISION;
  const isVerified = status === WORKER_STATUS.VERIFIED;
  const isRejected = status === WORKER_STATUS.REJECTED;
  const isLocked = isInReview || isVerified || isRejected;

  const [step, setStep] = useState(0);
  const [locationMapOpen, setLocationMapOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JoinWorkerSchemaType>({
    resolver: zodResolver(JoinWorkerSchema),
    defaultValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const {
    uploadImage,
    loading: profileUploading,
    progress: profileProgress,
  } = useImageUpload({
    purpose: UploadPurposes.WORKER_PROFILE_IMAGE,
  });

  const populateFromWorker = useCallback(() => {
    reset({
      about: worker?.about ?? '',
      displayName: worker?.displayName ?? '',
      tagline: worker?.tagline ?? '',
      experience: worker?.experience ?? 0,
      profileImage: worker?.profileImage ?? '',
      phone: worker?.phone ?? userPhone ?? '',
      location: worker?.location ?? { addressLabel: '', coordinates: [0, 0], type: 'Point' },
      languages: worker?.languages ?? [],
      documents: DOC_KEYS.reduce(
        (acc, key) => {
          acc[key] = worker?.documents.find(d => d.type === DOC_KEY_TO_TYPE[key])?.url ?? '';
          return acc;
        },
        {} as Record<DocKey, string>
      ),
    });
  }, [worker, userPhone, reset]);

  useEffect(() => {
    populateFromWorker();
    setEditMode(false);
  }, [populateFromWorker]);

  const revisionFlags = useMemo<Partial<Record<DocumentType, string>>>(() => {
    const map: Partial<Record<DocumentType, string>> = {};
    if (!worker || !Array.isArray(worker.documents)) {
      return map;
    }
    for (const f of worker.documents) {
      if (f.status === 'rejected' && f.rejectReason) {
        map[f.type] = f.rejectReason;
      }
    }
    return map;
  }, [worker]);

  const isFieldEditable = (field: string): boolean => {
    if (isLocked) {
      return false;
    }
    if (isNew) {
      return true;
    }
    if (isRevision) {
      if (isDocKey(field)) {
        const docType = DOC_KEY_TO_TYPE[field];
        return docType in revisionFlags;
      }
      return false;
    }
    if (isPendingDraft) {
      return editMode;
    }
    return false;
  };

  const formIsEditable = isNew || isRevision || (isPendingDraft && editMode);

  const banner = useMemo(() => {
    if (isPendingDraft) {
      return {
        tone: 'info' as const,
        Icon: FileEdit,
        title: 'Application Draft',
        body: editMode
          ? "Editing your details. Save changes when you're done."
          : "Your application hasn't been submitted for review yet. Click Edit to make changes.",
      };
    }
    if (isInReview) {
      return {
        tone: 'info' as const,
        Icon: Clock,
        title: 'Application In Review',
        body: "Our team is reviewing your details. You can't make changes right now.",
      };
    }
    if (isRevision) {
      return {
        tone: 'warn' as const,
        Icon: AlertTriangle,
        title: 'Action Required — Revision Requested',
        body:
          worker?.rejectReason ??
          'Compliance team flagged a few items. Update the highlighted fields and resubmit.',
      };
    }
    return null;
  }, [isPendingDraft, isInReview, isRevision, editMode, worker?.rejectReason]);

  const next = async () => {
    if (step === 0) {
      const isValid = await trigger([
        'displayName',
        'experience',
        'tagline',
        'about',
        'location',
        'languages',
      ]);
      if (!isValid) {
        return;
      }
    }
    setStep(s => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => setStep(s => Math.max(0, s - 1));

  const startEdit = () => setEditMode(true);
  const cancelEdit = () => {
    populateFromWorker();
    setEditMode(false);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-muted-foreground bg-white p-10 text-center text-sm text-muted-foreground shadow-sm">
        Loading application…
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-section-green-border bg-section-green p-10 text-center shadow-sm">
        <BadgeCheck className="mx-auto text-section-green-text" size={40} />
        <h2 className="mt-2 text-xl font-bold text-section-green-text">
          You're a Verified Provider
        </h2>
        <p className="mt-1 text-sm text-section-green-text">
          Your application has been approved. You're all set to start accepting jobs.
        </p>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-section-red-border bg-section-red p-10 text-center shadow-sm">
        <AlertTriangle className="mx-auto text-section-red-text" size={40} />
        <h2 className="mt-2 text-xl font-bold text-section-red-text">Application Rejected</h2>
        <p className="mt-1 text-sm text-section-red-text">
          {worker?.rejectReason ?? 'Please contact support for more details.'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl"
    >
      <div className="overflow-hidden rounded-2xl shadow-2xl border">
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          className="space-y-6 md:p-8 p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold ">Provider Application</h2>
              <p className="text-sm text-muted-foreground">
                Complete your professional profile to start accepting jobs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isInReview && (
                <span className="rounded-full border border-section-blue-border bg-section-blue px-3 py-1 text-xs font-semibold uppercase tracking-wider text-section-blue-text">
                  In Review
                </span>
              )}
              {isPendingDraft && (
                <span className="rounded-full border border-muted-foreground bg-muted-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Draft
                </span>
              )}
              {isRevision && (
                <span className="rounded-full border border-section-amber-border bg-section-amber px-3 py-1 text-xs font-semibold uppercase tracking-wider text-section-amber-text">
                  Needs Revision
                </span>
              )}
              {isPendingDraft && (
                <Button
                  onClick={editMode ? cancelEdit : startEdit}
                  iconLeft={editMode ? <X size={13} /> : <Pencil size={13} />}
                  type="button"
                  variant={editMode ? 'secondary' : 'outline'}
                >
                  {editMode ? 'Cancel Edit' : 'Edit'}
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {banner && (
              <motion.div
                key={banner.title}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'flex items-start gap-3 rounded-xl border p-4 overflow-hidden',
                  banner.tone === 'warn'
                    ? 'border-section-amber-border bg-section-amber'
                    : 'border-section-blue-border bg-section-blue'
                )}
              >
                <banner.Icon
                  size={22}
                  className={cn(
                    'shrink-0',
                    banner.tone === 'warn' ? 'text-section-amber-text' : 'text-section-blue-text'
                  )}
                />
                <div>
                  <h4 className="font-semibold">{banner.title}</h4>
                  <p className="text-sm text-muted-foreground">{banner.body}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step section */}
          <div className="flex items-center justify-between px-2">
            {STEPS.map((s, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <div key={s.key} className="flex flex-1 items-center">
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    className="flex flex-col items-center gap-1 hover:cursor-pointer"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full font-bold transition',
                        active
                          ? 'bg-section-blue-text text-white shadow-md'
                          : done
                            ? 'bg-section-green-text text-white'
                            : 'bg-muted-foreground/10 text-muted-foreground'
                      )}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        active ? 'text-section-blue-text' : 'text-muted-foreground'
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 mb-5 h-0.5 flex-1',
                        i < step ? 'bg-section-green-text' : 'bg-muted-foreground/10'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <div className="min-h-85">
            {step === 0 && (
              <div className="space-y-6">
                <FormSection icon={User} title="Professional Profile">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <Controller
                      name="profileImage"
                      control={control}
                      render={({ field }) => (
                        <ProfileImage
                          src={field.value}
                          name={worker?.displayName}
                          editable={isFieldEditable('profileImage')}
                          loading={profileUploading}
                          progress={profileProgress}
                          onChange={async file => {
                            const url = await uploadImage(file);
                            if (url) {
                              field.onChange(url);
                            }
                          }}
                        />
                      )}
                    />

                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                      {isFieldEditable('displayName') ? (
                        <div>
                          <Label>Full Name</Label>
                          <Input
                            placeholder="e.g., John's Plumbing Services"
                            className="px-3"
                            error={errors.displayName?.message}
                            {...register('displayName', { setValueAs: v => v.trim() })}
                          />
                        </div>
                      ) : (
                        <ReadOnlyField label="Full Name" value={watch('displayName')} />
                      )}

                      {isFieldEditable('tagline') ? (
                        <div>
                          <Label>Professional Tagline</Label>
                          <Input
                            placeholder="e.g., Expert Plumber, 10+ yrs"
                            className="px-3"
                            error={errors.tagline?.message}
                            {...register('tagline', { setValueAs: v => v.trim() })}
                          />
                        </div>
                      ) : (
                        <ReadOnlyField label="Professional Tagline" value={watch('tagline')} />
                      )}
                    </div>
                  </div>

                  {isFieldEditable('experience') ? (
                    <div>
                      <Label>Years of Experience</Label>
                      <Input
                        placeholder="e.g., 5"
                        className="px-3 md:max-w-xs"
                        type="number"
                        rightIcon={<span className="text-xs text-muted-foreground">yrs</span>}
                        error={errors.experience?.message}
                        {...register('experience', { valueAsNumber: true })}
                      />
                    </div>
                  ) : (
                    <div className="md:max-w-xs">
                      <ReadOnlyField
                        label="Years of Experience"
                        value={`${watch('experience') || 0} yrs`}
                      />
                    </div>
                  )}

                  {isFieldEditable('about') ? (
                    <div>
                      <Label>About Your Service</Label>
                      <Textarea
                        placeholder="Tell customers what makes your service stand out…"
                        className="px-3"
                        error={errors.about?.message}
                        {...register('about', { setValueAs: v => v.trim() })}
                      />
                    </div>
                  ) : (
                    <ReadOnlyField label="About Your Service" value={watch('about')} multiline />
                  )}
                </FormSection>

                <FormSection icon={Globe} title="Languages Spoken">
                  <Controller
                    name="languages"
                    control={control}
                    render={({ field, fieldState }) => (
                      <MultiSelectInput
                        value={field.value as string[]}
                        onChange={field.onChange}
                        options={INDIAN_LANGUAGES}
                        icon={Globe}
                        placeholder="Search and add a language…"
                        emptyText="No languages specified"
                        disabled={!isFieldEditable('languages')}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </FormSection>

                <FormSection icon={MapPin} title="Service Location">
                  <div className="rounded-xl border border-border/60 bg-muted/40 overflow-hidden">
                    <Controller
                      name="location"
                      control={control}
                      render={({ field }) => (
                        <>
                          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              <MapPin size={13} />
                              Location
                            </div>
                            {field.value?.coordinates && (
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {field.value.coordinates[1].toFixed(4)},{' '}
                                {field.value.coordinates[0].toFixed(4)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between px-4 py-3">
                            <div className="text-sm">
                              {field.value?.addressLabel ? (
                                <p className="text-foreground font-medium leading-snug">
                                  {field.value.addressLabel}
                                </p>
                              ) : (
                                <p className="text-muted-foreground italic text-xs">
                                  No location selected
                                </p>
                              )}
                            </div>
                            {isFieldEditable('location') && (
                              <button
                                type="button"
                                onClick={() => setLocationMapOpen(true)}
                                className="ml-3 shrink-0 rounded-lg border border-muted-foreground px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/50"
                              >
                                <MapPin size={13} className="mr-1 inline" />
                                {field.value?.coordinates ? 'Update' : 'Set'}
                              </button>
                            )}
                          </div>
                          {locationMapOpen && (
                            <MapSelector
                              onLocationSelect={(coords, address) => {
                                const addressLabel = address
                                  ? [address.place, address.city, address.state, address.pincode]
                                      .filter(Boolean)
                                      .join(', ')
                                  : '';
                                field.onChange({
                                  type: 'Point',
                                  coordinates: coords,
                                  addressLabel,
                                });
                                setLocationMapOpen(false);
                              }}
                              onClose={() => setLocationMapOpen(false)}
                            />
                          )}
                        </>
                      )}
                    />
                  </div>
                  {errors.location?.addressLabel && (
                    <p className="text-xs text-red-600">{errors.location.addressLabel.message}</p>
                  )}
                </FormSection>
              </div>
            )}

            {step === 1 && (
              <FormSection icon={ShieldCheck} title="Identity Verification">
                <div className="grid grid-cols-2 gap-4">
                  {DOC_KEYS.map(key => {
                    const docType: DocumentType = DOC_KEY_TO_TYPE[key];
                    const rejectReason = revisionFlags[docType];
                    const isRejectedDoc = !!rejectReason;
                    return (
                      <div
                        key={key}
                        className={
                          isRejectedDoc
                            ? 'rounded-lg border border-section-amber-border bg-section-amber p-2'
                            : ''
                        }
                      >
                        <Label>
                          {DOC_LABELS[key]}
                          {isRejectedDoc && (
                            <span className="ml-2 rounded-full bg-section-amber-border/40 px-2 py-0.5 text-[10px] font-bold uppercase text-section-amber-text">
                              Rejected
                            </span>
                          )}
                        </Label>
                        {isRejectedDoc && (
                          <p className="mb-1 text-xs text-section-amber-text">
                            <span className="font-semibold">Reason:</span> {rejectReason}
                          </p>
                        )}
                        <Controller
                          name={`documents.${key}` as const}
                          control={control}
                          render={({ field, fieldState }) => (
                            <ImageUpload
                              value={field.value}
                              isEditable={isFieldEditable(key)}
                              onChange={url => field.onChange(url)}
                              purpose={UploadPurposes.WORKER_DOCUMENT}
                              error={fieldState.error?.message}
                              className="w-full mt-2"
                            />
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </FormSection>
            )}
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              type="button"
              onClick={back}
              size="md"
              disabled={step === 0}
              variant="secondary"
              iconLeft={<ArrowLeft size={14} />}
            >
              Back
            </Button>
            <span className="text-xs text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  next();
                }}
                size="md"
                variant="blue"
                iconLeft={<ArrowRight size={14} />}
              >
                Next
              </Button>
            ) : formIsEditable ? (
              <Button
                type="submit"
                loading={isSubmitting}
                variant={isRevision ? 'warning' : 'green'}
              >
                {isSubmitting
                  ? 'Submitting…'
                  : isRevision
                    ? 'Resubmit for Review'
                    : isNew
                      ? 'Submit Application'
                      : 'Save Changes'}
              </Button>
            ) : (
              <span className="rounded-lg bg-muted/50 px-5 py-2 text-sm font-semibold text-muted-foreground">
                {isPendingDraft ? 'Click Edit ' : 'Locked'}
              </span>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Icon size={20} className="text-section-blue-text" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}) {
  const hasValue = value !== undefined && value !== null && value !== '';
  return (
    <div>
      <Label className="text-muted-foreground">{label}</Label>
      <div
        className={cn(
          'mt-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-foreground',
          multiline && 'whitespace-pre-wrap leading-relaxed'
        )}
      >
        {hasValue ? value : <span className="italic text-muted-foreground">Not provided</span>}
      </div>
    </div>
  );
}
