import { PAYOUT_API } from '@/constants';
import api from '@/lib/api/axios';
import type { ApiResponse } from '@/types/api';
import type { PayoutListingResponse, PayoutListQuery } from '@/types/payout';

const PayoutService = {
  requestPayout: async (amount: number): Promise<void> => {
    const res = await api.post<ApiResponse<void>>(PAYOUT_API.REQUEST, { amount });
    return res.data.data;
  },
  getPayoutRequests: async (params: PayoutListQuery): Promise<PayoutListingResponse> => {
    const res = await api.get<ApiResponse<PayoutListingResponse>>(PAYOUT_API.ROOT, { params });
    return res.data.data;
  },
};

export default PayoutService;
