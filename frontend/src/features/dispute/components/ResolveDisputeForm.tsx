import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, IndianRupee } from 'lucide-react';
import { useForm, type Resolver, Controller } from 'react-hook-form';
import { toast } from 'sonner';

import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import Select from '@/components/atoms/Select';
import { Textarea } from '@/components/atoms/Textarea';
import {
  DISPUTE_RESOLUTION,
  DISPUTE_RESOLUTION_VALUES,
  DISPUTE_STATUS,
  DISPUTE_STATUS_VALUES,
} from '@/constants/dispute';
import type { Dispute } from '@/types/dispute';

import { resolveDisputeSchema, type ResolveDisputeFormType } from '../index';

interface Props {
  dispute: Dispute | null;
  onSubmit: (data: ResolveDisputeFormType) => Promise<string | undefined | void>;
  isSubmitting: boolean;
}

export function ResolveDisputeForm({ dispute, onSubmit, isSubmitting }: Props) {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ResolveDisputeFormType>({
    resolver: zodResolver(resolveDisputeSchema) as Resolver<ResolveDisputeFormType>,
    defaultValues: {
      status: DISPUTE_STATUS.UNDER_REVIEW,
      note: '',
    },
    mode: 'onChange',
  });

  const onSubmitForm = async (data: ResolveDisputeFormType) => {
    const message = await onSubmit({
      status: data.status,
      resolution: data.status === DISPUTE_STATUS.RESOLVED ? data.resolution : undefined,
      note: data.note,
      refundedAmount:
        data.resolution === DISPUTE_RESOLUTION.REFUND_PARTIAL ? data.refundedAmount : undefined,
    });
    if (message) {
      toast.success(message);
      reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-section-blue border border-border flex gap-3 items-center">
        <AlertCircle className="text-section-blue-text shrink-0" size={20} />
        <div className="text-xs text-section-blue-text leading-relaxed">
          You are resolving Dispute <strong>#{dispute?.disputeId}</strong>. Confirming resolution
          modifies Stripe payments, transfers payouts, updates customer refunds, and notifies both
          parties instantly.
        </div>
      </div>

      <form id="resolve-dispute-form" onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Dispute Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  options={DISPUTE_STATUS_VALUES.filter(
                    status => status !== DISPUTE_STATUS.PENDING
                  ).map(v => ({
                    label: v.replaceAll('_', ' ').slice(0, 1).toUpperCase() + v.slice(1),
                    value: v,
                  }))}
                  value={field.value}
                  onChange={val => {
                    field.onChange(val);
                    if (val === 'resolved') {
                      setValue('resolution', 'refund_full');
                    } else {
                      setValue('resolution', undefined);
                      setValue('refundedAmount', undefined);
                    }
                  }}
                  placeholder="Select status..."
                  error={errors.status?.message}
                />
              )}
            />
          </div>

          {watch('status') === DISPUTE_STATUS.RESOLVED && (
            <div className="flex flex-col gap-2">
              <Label>Resolution Type</Label>
              <Controller
                name="resolution"
                control={control}
                render={({ field }) => (
                  <Select
                    options={DISPUTE_RESOLUTION_VALUES.map(r => ({
                      label: r.replaceAll('_', ' ').slice(0, 1).toUpperCase() + r.slice(1),
                      value: r,
                    }))}
                    value={field.value}
                    onChange={val => {
                      field.onChange(val);
                      if (val !== 'refund_partial') {
                        setValue('refundedAmount', undefined);
                      }
                    }}
                    placeholder="Select resolution type..."
                    error={errors.resolution?.message}
                  />
                )}
              />
            </div>
          )}
        </div>

        {watch('resolution') === DISPUTE_RESOLUTION.REFUND_PARTIAL && (
          <div className="flex flex-col gap-2 max-w-md">
            <Label>Refunded Amount (INR)</Label>
            <div className="relative">
              <Input
                error={errors.refundedAmount?.message}
                type="number"
                leftIcon={<IndianRupee size={16} />}
                placeholder="Enter refund amount..."
                {...register('refundedAmount')}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label>Resolution Note</Label>
          <Textarea
            placeholder="Enter the official resolution details that will be shared with both parties..."
            disabled={isSubmitting}
            error={errors.note?.message}
            rows={4}
            {...register('note')}
          />
        </div>
      </form>
    </div>
  );
}
