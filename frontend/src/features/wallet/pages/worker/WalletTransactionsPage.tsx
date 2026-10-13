import {
  TransactionListView,
  useWorkerTransactions,
  useTransactionFilterParams,
} from '@/features/wallet';

export default function WalletTransactionsPage() {
  const filters = useTransactionFilterParams();
  const { category, search, type, fromDateString, toDateString } = filters;
  const { data, ...query } = useWorkerTransactions({
    category,
    search,
    type,
    fromDate: fromDateString,
    toDate: toDateString,
  });
  const transactions = data?.pages.flatMap(p => p.transactions) ?? [];

  return <TransactionListView transactions={transactions} filters={filters} query={query} />;
}
