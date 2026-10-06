import { PAYOUT_API, WALLET_API } from '@/constants/apiRoutes';
import type { PayoutMethod } from '@/constants/payout';
import type { BankDetailsFormType, UpiDetailsFormType } from '@/features/wallet';
import api from '@/lib/api/axios';
import type { ApiResponse } from '@/types/api';
import type {
  Wallet,
  WalletTransactionListingResponse,
  WalletTransactionListQuery,
} from '@/types/wallet';

type WalletWithMessage = { wallet: Wallet; message: string };

const WalletService = {
  getWallet: async (): Promise<Wallet> => {
    const res = await api.get<ApiResponse<Wallet>>(WALLET_API.ROOT);
    return res.data.data;
  },
  getTransactions: async (
    params: WalletTransactionListQuery
  ): Promise<WalletTransactionListingResponse> => {
    const res = await api.get<ApiResponse<WalletTransactionListingResponse>>(
      WALLET_API.TRANSACTIONS,
      { params }
    );
    return res.data.data;
  },
  updateBankDetails: async (data: BankDetailsFormType): Promise<WalletWithMessage> => {
    const res = await api.put<ApiResponse<Wallet>>(PAYOUT_API.BANK, data);
    return {
      wallet: res.data.data,
      message: res.data.message,
    };
  },
  updateUpiDetails: async (data: UpiDetailsFormType): Promise<WalletWithMessage> => {
    const res = await api.put<ApiResponse<Wallet>>(PAYOUT_API.UPI, data);
    return {
      wallet: res.data.data,
      message: res.data.message,
    };
  },
  setPrimaryMethod: async (method: PayoutMethod): Promise<WalletWithMessage> => {
    const res = await api.patch<ApiResponse<Wallet>>(PAYOUT_API.PRIMARY, { method });
    return {
      wallet: res.data.data,
      message: res.data.message,
    };
  },
  removeBankDetails: async (): Promise<WalletWithMessage> => {
    const res = await api.delete<ApiResponse<Wallet>>(PAYOUT_API.BANK);
    return {
      wallet: res.data.data,
      message: res.data.message,
    };
  },
  removeUpiDetails: async (): Promise<WalletWithMessage> => {
    const res = await api.delete<ApiResponse<Wallet>>(PAYOUT_API.UPI);
    return {
      wallet: res.data.data,
      message: res.data.message,
    };
  },
};

export default WalletService;
