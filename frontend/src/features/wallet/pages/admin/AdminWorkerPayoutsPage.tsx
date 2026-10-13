import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import {
  PayoutDetailsModal,
  PayoutListView,
  useAdminPayouts,
  usePayoutFilterParams,
} from '@/features/wallet';
import type { PayoutRequest } from '@/types/payout';
import type { WorkerProfileDetails } from '@/types/worker';

type WorkerOutletContext = {
  worker: WorkerProfileDetails;
};

export default function AdminWorkerPayoutsPage() {
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const { worker } = useOutletContext<WorkerOutletContext>();

  const filterParams = usePayoutFilterParams();
  const query = useAdminPayouts({
    workerId: worker.id,
    search: filterParams.search,
    status: filterParams.status,
    fromDate: filterParams.fromDateString,
    toDate: filterParams.toDateString,
  });

  const payouts = query.data?.pages.flatMap(p => p.payouts) ?? [];

  return (
    <div className="space-y-4">
      <PayoutListView
        filters={filterParams}
        payouts={payouts}
        query={query}
        onViewPayout={setSelectedPayout}
      />

      {selectedPayout && (
        <PayoutDetailsModal
          mode="admin"
          open={Boolean(selectedPayout)}
          payout={selectedPayout}
          onClose={() => setSelectedPayout(null)}
        />
      )}
    </div>
  );
}
