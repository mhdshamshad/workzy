import { ArrowDownUp, Banknote, CreditCard } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import PageHeader from '@/components/molecules/PageHeader';
import { cn } from '@/lib/utils';

import WalletOverview from '../../components/WalletOverview';
import { useWallet } from '../../hooks/useWallet';

const NAV_TABS = [
  { path: 'transactions', label: 'Ledger Transactions', icon: ArrowDownUp },
  { path: 'payouts', label: 'Withdrawal Requests', icon: Banknote },
  { path: 'payments', label: 'Booking Payments', icon: CreditCard },
];

export default function WorkerWalletLayout() {
  const { data: wallet, isLoading, isError, refetch } = useWallet();

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader
        title="Wallet & Payments"
        description="Manage your earnings, direct withdrawal settlements, and client payments"
      />

      <WalletOverview
        wallet={wallet}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        role="worker"
      />

      <div className="pb-16">
        <div className="flex border-b border-border overflow-x-auto no-scrollbar mb-6">
          {NAV_TABS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'text-foreground font-semibold border-foreground'
                    : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40'
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}
