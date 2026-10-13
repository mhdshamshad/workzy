import { useState } from 'react';

import {
  PayoutDetailsModal,
  PayoutListView,
  usePayoutFilterParams,
  useWorkerPayouts,
} from '@/features/wallet';
import type { PayoutRequest } from '@/types/payout';

export default function WalletPayoutsPage() {
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);

  const filterParams = usePayoutFilterParams();
  const query = useWorkerPayouts({
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
          mode="worker"
          open={Boolean(selectedPayout)}
          payout={selectedPayout}
          onClose={() => setSelectedPayout(null)}
        />
      )}
    </div>
  );
}
