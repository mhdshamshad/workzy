import { toast } from 'sonner';

import { AppModal } from '@/components/molecules/AppModal';
import { PAYOUT_METHOD, type PayoutMethod } from '@/constants/payout';
import { useRemoveBankDetails, useRemoveUpiDetails } from '@/features/wallet';
import { handleApiError } from '@/utils/handleApiError';

interface RemovePayoutMethodModalProps {
  open: boolean;
  method: PayoutMethod | null;
  isOnlyMethod: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RemovePayoutMethodModal({
  open,
  method,
  isOnlyMethod,
  onClose,
  onSuccess,
}: RemovePayoutMethodModalProps) {
  const removeBank = useRemoveBankDetails();
  const removeUpi = useRemoveUpiDetails();

  const isBank = method === PAYOUT_METHOD.BANK;
  const label = isBank ? 'Bank Account' : 'UPI ID';
  const isRemoving = removeBank.isPending || removeUpi.isPending;

  const handleConfirm = async () => {
    try {
      if (isBank) {
        const res = await removeBank.mutateAsync();
        toast.success(res.message);
      } else {
        const res = await removeUpi.mutateAsync();
        toast.success(res.message);
      }
      onSuccess();
    } catch (err) {
      toast.error(handleApiError(err));
    }
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Remove ${label}`}
      description={
        isOnlyMethod
          ? 'Removing your only payout method will disable withdrawals until you add a new one. Are you sure you want to proceed?'
          : `Are you sure you want to remove your ${label}?`
      }
      isDescriptionHidden={false}
      confirmText="Remove"
      buttonVariant="red"
      isConfirmLoading={isRemoving}
      onConfirm={handleConfirm}
      className="sm:max-w-md"
    />
  );
}
