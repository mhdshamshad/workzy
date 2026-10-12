import { useOutletContext } from 'react-router-dom';

import {
  useTransactionFilterParams,
  TransactionListView,
  useAdminWorkerTransactions,
} from '@/features/wallet';
import type { WorkerProfileDetails } from '@/types/worker';

type WorkerOutletContext = {
  worker: WorkerProfileDetails;
};

export default function AdminWorkerTransactionsPage() {
  const { worker } = useOutletContext<WorkerOutletContext>();

  const filters = useTransactionFilterParams();
  const { category, search, type, fromDateString, toDateString } = filters;
  const { data, ...query } = useAdminWorkerTransactions(worker.id, {
    category,
    search,
    type,
    fromDate: fromDateString,
    toDate: toDateString,
  });

  const transactions = data?.pages.flatMap(p => p.transactions) ?? [];

  return <TransactionListView transactions={transactions} filters={filters} query={query} />;
}
