import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Pencil,
  Phone,
  Save,
  Sparkles,
  User2,
  X,
  Zap,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import { Textarea } from '@/components/atoms/Textarea';
import { ImageUpload } from '@/components/molecules/ImageUpload';
import MultiSelectInput from '@/components/molecules/MultiSelectInput';
import { Badge } from '@/components/ui/badge';
import { INDIAN_LANGUAGES, WORKER_STATUS, WORKER_STATUS_CONFIG } from '@/constants';
import { UploadPurposes } from '@/constants/upload';
const MapSelector = lazy(() => import('@/features/profile/components/MapSelector'));
import type { WorkerProfileDetails } from '@/types/worker';

import { AvailabilitySection } from '../../components/AvailabilitySection';
import { useAvailability } from '../../hooks/useAvailability';
import {
  workerProfileSchema,
  type WorkerProfileSchemaType,
} from '../validation/workerProfileSchema';

interface WorkerProfileSectionProps {
  workerData: WorkerProfileDetails;
  onSubmit: (data: WorkerProfileSchemaType) => Promise<string>;
  onChangePhone: () => void;
}

function InfoChip({
  icon,
  label,
  value,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-muted/50 border border-border/60">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
      {action}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-primary">{icon}</span>
      <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>
      <div className="flex-1 h-px bg-border ml-2" />
    </div>
  );
}

export default function WorkerProfileSection({
  workerData,
  onSubmit,
  onChangePhone,
}: WorkerProfileSectionProps) {
  const { addSlot, updateSlot, removeSlot } = useAvailability();

  const [isEditing, setIsEditing] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [locationMapOpen, setLocationMapOpen] = useState(false);

  const { displayName, tagline, about, status, languages } = workerData;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WorkerProfileSchemaType>({
    resolver: zodResolver(workerProfileSchema),
    defaultValues: workerData as unknown as WorkerProfileSchemaType,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    reset(workerData as unknown as WorkerProfileSchemaType);
  }, [reset, workerData]);

  useEffect(() => {
    if (!errors.availability) {
      return;
    }
    const find = (e: unknown): string | null => {
      if (!e || typeof e !== 'object') {
        return null;
      }
      if ('message' in e && typeof (e as { message?: unknown }).message === 'string') {
        return (e as { message: string }).message;
      }
      for (const v of Object.values(e as Record<string, unknown>)) {
        const m = find(v);
        if (m) {
          return m;
        }
      }
      return null;
    };
    const msg = find(errors.availability);
    if (msg) {
      toast.error(msg);
    }
  }, [errors.availability]);

  const handleFormSubmit = async (data: WorkerProfileSchemaType) => {
    const message = await onSubmit(data);
    if (message) {
      setIsEditing(false);
      setLocationMapOpen(false);
      toast.success(message);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const },
    }),
  };

  const fieldVariants = {
    view: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    edit: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
  };
  const config = WORKER_STATUS_CONFIG[status] ?? WORKER_STATUS_CONFIG[WORKER_STATUS.PENDING];
  const StatusIcon = config.icon;

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 pt-2 mt-4">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between px-8 pt-7 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User2 size={16} className="text-primary" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Worker Profile</h2>
              <Badge variant={config.badgeVariant}>
                <StatusIcon className="size-3" />
                {config.label}
              </Badge>
            </div>

            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="edit-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                >
                  <Button
                    iconRight={<Pencil size={15} />}
                    onClick={() => setIsEditing(true)}
                    type="button"
                    variant="blue"
                    size="sm"
                  >
                    Edit Profile
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="save-btns"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  className="flex gap-2"
                >
                  <Button
                    variant="secondary"
                    iconRight={<X size={15} />}
                    type="button"
                    size="sm"
                    disabled={isImageUploading}
                    onClick={() => {
                      setIsEditing(false);
                      setLocationMapOpen(false);
                      reset(workerData as unknown as WorkerProfileSchemaType);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="green"
                    iconRight={<Save size={15} />}
                    type="submit"
                    size="sm"
                    disabled={isImageUploading || isSubmitting}
                    loading={isSubmitting}
                  >
                    Save Changes
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <SectionHeader icon={<Sparkles size={14} />} title="Identity" />
                <div>
                  <Label>Display Name</Label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="dn-edit"
                        initial="exit"
                        animate="edit"
                        exit="exit"
                        variants={fieldVariants}
                      >
                        <Input
                          placeholder="Your display name"
                          className="px-3"
                          error={errors.displayName?.message}
                          {...register('displayName', { setValueAs: v => v.trim() })}
                        />
                      </motion.div>
                    ) : (
                      <motion.p
                        key="dn-view"
                        initial="exit"
                        animate="view"
                        exit="exit"
                        variants={fieldVariants}
                        className="text-lg font-semibold text-foreground py-2"
                      >
                        {displayName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <Label>Tagline</Label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="tl-edit"
                        initial="exit"
                        animate="edit"
                        exit="exit"
                        variants={fieldVariants}
                      >
                        <Input
                          placeholder="A short tagline describing you"
                          className="px-3"
                          error={errors.tagline?.message}
                          {...register('tagline', { setValueAs: v => v.trim() })}
                        />
                      </motion.div>
                    ) : (
                      <motion.p
                        key="tl-view"
                        initial="exit"
                        animate="view"
                        exit="exit"
                        variants={fieldVariants}
                        className="text-base text-muted-foreground py-2 italic"
                      >
                        "{tagline}"
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <Label>About</Label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="ab-edit"
                        initial="exit"
                        animate="edit"
                        exit="exit"
                        variants={fieldVariants}
                      >
                        <Textarea
                          placeholder="Tell clients about yourself…"
                          error={errors.about?.message}
                          {...register('about', { setValueAs: v => v.trim() })}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ab-view"
                        initial="exit"
                        animate="view"
                        exit="exit"
                        variants={fieldVariants}
                        className="p-4 rounded-xl bg-section-blue border border-section-blue-border"
                      >
                        <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap">
                          {about}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <Label>Languages Spoken</Label>
                  <AnimatePresence mode="wait">
                    {isEditing ? (
                      <motion.div
                        key="lang-edit"
                        initial="exit"
                        animate="edit"
                        exit="exit"
                        variants={fieldVariants}
                      >
                        <Controller
                          name="languages"
                          control={control}
                          render={({ field, fieldState }) => (
                            <MultiSelectInput
                              value={field.value ?? []}
                              onChange={field.onChange}
                              options={INDIAN_LANGUAGES}
                              icon={Globe}
                              placeholder="Search and add a language…"
                              error={fieldState.error?.message}
                            />
                          )}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="lang-view"
                        initial="exit"
                        animate="view"
                        exit="exit"
                        variants={fieldVariants}
                        className="flex flex-wrap gap-1.5 pt-2"
                      >
                        {languages && languages.length > 0 ? (
                          languages.map(lang => (
                            <span
                              key={lang}
                              className="rounded-full border border-section-blue-border bg-section-blue px-2.5 py-0.5 text-xs font-medium text-section-blue-text"
                            >
                              {lang}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm italic text-muted-foreground py-2">
                            No languages specified
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key="loc-edit"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
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
                              {isEditing && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setLocationMapOpen(true)}
                                  className="ml-3 shrink-0"
                                >
                                  <MapPin size={13} className="mr-1" />
                                  {field.value?.coordinates ? 'Update' : 'Set'}
                                </Button>
                              )}
                            </div>
                            {locationMapOpen && (
                              <Suspense
                                fallback={
                                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                  </div>
                                }
                              >
                                <MapSelector
                                  onLocationSelect={(coords, address) => {
                                    const addressLabel = address
                                      ? [
                                          address.place,
                                          address.city,
                                          address.state,
                                          address.pincode,
                                        ]
                                          .filter(Boolean)
                                          .join(', ')
                                      : '';
                                    field.onChange({
                                      type: 'Point',
                                      coordinates: coords,
                                      addressLabel,
                                    });
                                  }}
                                  onClose={() => setLocationMapOpen(false)}
                                />
                              </Suspense>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="space-y-6">
                <SectionHeader icon={<Zap size={14} />} title="Quick Info" />
                <div>
                  <Label>Cover Image</Label>
                  <Controller
                    name="coverImage"
                    control={control}
                    render={({ field, fieldState }) => (
                      <ImageUpload
                        value={field.value}
                        onChange={url => field.onChange(url)}
                        error={fieldState.error?.message}
                        className="w-full mt-2"
                        isEditable={isEditing}
                        purpose={UploadPurposes.WORKER_COVER_IMAGE}
                        onUploadingChange={setIsImageUploading}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2.5">
                  <InfoChip
                    icon={<Phone size={14} />}
                    label="Phone"
                    value={workerData.phone || 'Not provided'}
                    action={
                      <button
                        type="button"
                        onClick={onChangePhone}
                        aria-label="Change phone number"
                        title="Change phone number"
                        className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
                      >
                        <Pencil size={13} />
                      </button>
                    }
                  />
                  <InfoChip
                    icon={<Briefcase size={14} />}
                    label="Experience"
                    value={`${workerData.experience} yr${workerData.experience !== 1 ? 's' : ''}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-card rounded-2xl border border-border shadow-sm"
        >
          <div className="px-8 pt-7 pb-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar size={16} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Availability Schedule</h3>
            {!isEditing && (
              <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} /> Edit profile to update schedule
              </span>
            )}
          </div>
          <div className="px-8 pb-8 mt-4">
            <Controller
              name="availability"
              control={control}
              render={({ field, fieldState }) => (
                <AvailabilitySection
                  availability={field.value}
                  isEditing={isEditing}
                  hasError={!!fieldState.error}
                  onAddSlot={day => field.onChange(addSlot(field.value, day))}
                  onUpdateSlot={(day, index, fieldName, value) =>
                    field.onChange(updateSlot(field.value, day, index, fieldName, value))
                  }
                  onRemoveSlot={(day, index) => field.onChange(removeSlot(field.value, day, index))}
                />
              )}
            />
          </div>
        </motion.div>
      </form>
    </>
  );
}
