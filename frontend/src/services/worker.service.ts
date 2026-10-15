import { WORKER_API } from '@/constants';
import api from '@/lib/api/axios';
import type { ApiResponse } from '@/types/api';
import type { WorkerProfile, WorkerProfileDetails } from '@/types/worker';
import type { WorkerDashboardAnalytics } from '@/types/workerDashboard.types';

const WorkerService = {
  getWorkerProfile: async (workerId: string): Promise<WorkerProfile> => {
    const res = await api.get<ApiResponse<WorkerProfile>>(WORKER_API.BY_ID(workerId));
    return res.data.data;
  },
  getWorkerProfileDetails: async (workerId: string): Promise<WorkerProfileDetails> => {
    const res = await api.get<ApiResponse<WorkerProfileDetails>>(
      WORKER_API.DETAILS_BY_ID(workerId)
    );
    return res.data.data;
  },
  getWorkerDashboardAnalytics: async (): Promise<WorkerDashboardAnalytics> => {
    const res = await api.get<ApiResponse<WorkerDashboardAnalytics>>(WORKER_API.DASHBOARD);
    return res.data.data;
  },
};

export default WorkerService;
