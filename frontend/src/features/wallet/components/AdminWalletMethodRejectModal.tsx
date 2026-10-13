import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Textarea } from '@/components/atoms/Textarea';
import { AppModal } from '@/components/molecules/AppModal';
import { rejectPayoutSchema, type RejectPayoutFormType } from '@/features/wallet';

interface AdminWalletMethodRejectModalProps {
  open: boolean;
  title?: string;
  description?: string;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function AdminWalletMethodRejectModal({
  open,
  title = 'Are you sure you want to reject this payout method?',
  description = 'This reason will be shown to the worker so they can correct their payment details.',
  isLoading,
  onClose,
  onSubmit,
}: AdminWalletMethodRejectModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectPayoutFormType>({
    resolver: zodResolver(rejectPayoutSchema),
    defaultValues: { reason: '' },
  });

  useEffect(() => {
    if (!open) {
      reset({ reason: '' });
    }
  }, [open, reset]);

  const submit = handleSubmit(data => {
    onSubmit(data.reason);
  });

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      isDescriptionHidden={false}
      confirmText="Reject Method"
      buttonVariant="red"
      isConfirmLoading={isLoading}
      onConfirm={submit}
      className="sm:max-w-md"
    >
      <form onSubmit={submit}>
        <Textarea
          {...register('reason')}
          rows={4}
          placeholder="Reason for rejection (min 10 characters)"
          error={errors.reason?.message}
        />
      </form>
    </AppModal>
  );
}
