import { ADMIN_API } from '@/constants';
import type { PayoutMethod } from '@/constants/payout';
import type {
  ApprovePayoutFormType,
  RejectPayoutFormType,
} from '@/features/wallet/validation/admin-payout.schema';
import api from '@/lib/api/axios';
import type { ApiResponse } from '@/types/api';
import type {
  AdminPayoutListQuery,
  PayoutListingResponse,
  PayoutStatsResponse,
} from '@/types/payout';
import type { Wallet } from '@/types/wallet';

const AdminPayoutService = {
  getPayoutStats: async (): Promise<PayoutStatsResponse> => {
    const res = await api.get<ApiResponse<PayoutStatsResponse>>(ADMIN_API.PAYOUT.STATS);
    return res.data.data;
  },
  listPayouts: async (params?: AdminPayoutListQuery): Promise<PayoutListingResponse> => {
    const res = await api.get<ApiResponse<PayoutListingResponse>>(ADMIN_API.PAYOUT.ROOT, {
      params,
    });
    return res.data.data;
  },
  approvePayout: async (
    payoutId: string,
    data: ApprovePayoutFormType
  ): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(ADMIN_API.PAYOUT.APPROVE(payoutId), data);
    return { message: res.data.message };
  },
  rejectPayout: async (
    payoutId: string,
    data: RejectPayoutFormType
  ): Promise<{ message: string }> => {
    const res = await api.post<ApiResponse<null>>(ADMIN_API.PAYOUT.REJECT(payoutId), data);
    return { message: res.data.message };
  },
  verifyPayoutMethod: async (
    workerId: string,
    method: PayoutMethod
  ): Promise<{ wallet: Wallet; message: string }> => {
    const res = await api.patch<ApiResponse<Wallet>>(
      ADMIN_API.PAYOUT.METHOD_VERIFY(workerId, method)
    );
    return { wallet: res.data.data, message: res.data.message };
  },
  rejectPayoutMethod: async (
    workerId: string,
    method: PayoutMethod,
    reason: string
  ): Promise<{ wallet: Wallet; message: string }> => {
    const res = await api.patch<ApiResponse<Wallet>>(
      ADMIN_API.PAYOUT.METHOD_REJECT(workerId, method),
      { reason }
    );
    return { wallet: res.data.data, message: res.data.message };
  },
};

export default AdminPayoutService;
