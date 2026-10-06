import { ADMIN_API } from '@/constants';
import api from '@/lib/api/axios';
import type { ApiResponse } from '@/types/api';
import type {
  Wallet,
  WalletTransactionListingResponse,
  WalletTransactionListQuery,
} from '@/types/wallet';

const AdminWalletService = {
  getWorkerWallet: async (workerId: string): Promise<Wallet> => {
    const res = await api.get<ApiResponse<Wallet>>(ADMIN_API.WORKER_WALLET.ROOT(workerId));
    return res.data.data;
  },
  getWorkerTransactions: async (
    workerId: string,
    params: WalletTransactionListQuery
  ): Promise<WalletTransactionListingResponse> => {
    const res = await api.get<ApiResponse<WalletTransactionListingResponse>>(
      ADMIN_API.WORKER_WALLET.TRANSACTIONS(workerId),
      { params }
    );
    return res.data.data;
  },
};

export default AdminWalletService;
