import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';

import type { PayoutMethod } from '@/constants/payout';
import {
  useAdminWorkerWallet,
  useRejectPayoutMethod,
  useVerifyPayoutMethod,
  WalletOverview,
} from '@/features/wallet';
import type { WorkerProfileDetails } from '@/types/worker';

type WorkerOutletContext = {
  worker: WorkerProfileDetails;
};

export default function AdminWorkerWalletPage() {
  const { worker } = useOutletContext<WorkerOutletContext>();
  const { data: wallet, isLoading, isError, error, refetch } = useAdminWorkerWallet(worker.id);

  const verifyMutation = useVerifyPayoutMethod();
  const rejectMutation = useRejectPayoutMethod();

  const handleVerify = async (method: PayoutMethod) => {
    const res = await verifyMutation.mutateAsync({ workerId: worker.id, method });
    toast.success(res.message);
  };

  const handleReject = async (method: PayoutMethod, reason: string) => {
    const res = await rejectMutation.mutateAsync({ workerId: worker.id, method, reason });
    toast.success(res.message);
  };

  return (
    <WalletOverview
      wallet={wallet}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={refetch}
      role="admin"
      verifyMethod={handleVerify}
      rejectMethod={handleReject}
      isPending={verifyMutation.isPending || rejectMutation.isPending}
    />
  );
}
