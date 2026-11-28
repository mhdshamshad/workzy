import { WORKER_API } from '@/constants';
import { SERVICE_API } from '@/constants/apiRoutes/service.routes';
import type { ServiceFormType } from '@/features/worker/services/validation/ServiceFormData';
import api from '@/lib/api/axios';
import type { ApiResponse } from '@/types/api';
import type {
  CategoryOption,
  PublicServiceFilters,
  PublicWorkerServicesResponse,
  Service,
  ServiceFilters,
  WorkerServicesResponse,
} from '@/types/service';
import type { PublicWorkerListParams, PublicWorkerResponse } from '@/types/worker';

interface SResponse {
  message: string;
  service: Service;
}

const ServiceManagement = {
  getServices: async (params: ServiceFilters): Promise<WorkerServicesResponse> => {
    const res = await api.get<ApiResponse<WorkerServicesResponse>>(SERVICE_API.BY_WORKER, {
      params,
    });
    return res.data.data;
  },
  listWorkerPublicServices: async (
    workerId: string,
    params: PublicServiceFilters
  ): Promise<PublicWorkerServicesResponse> => {
    const res = await api.get<ApiResponse<PublicWorkerServicesResponse>>(
      SERVICE_API.PUBLIC(workerId),
      {
        params,
      }
    );
    return res.data.data;
  },
  getWorkerServiceCategories: async (): Promise<{ categories: CategoryOption[] }> => {
    const res = await api.get<ApiResponse<{ categories: CategoryOption[] }>>(
      SERVICE_API.SERVICE_CATEGORIES
    );
    return res.data.data;
  },

  toggleStatus: async (serviceId: string): Promise<{ message: string }> => {
    const res = await api.patch<ApiResponse<{ isAvailable: boolean }>>(
      SERVICE_API.STATUS(serviceId)
    );
    return { message: res.data.message };
  },

  updateService: async (serviceId: string, data: ServiceFormType): Promise<SResponse> => {
    const res = await api.patch<ApiResponse<{ service: Service }>>(
      SERVICE_API.UPDATE(serviceId),
      data
    );
    return {
      message: res.data.message,
      service: res.data.data.service,
    };
  },
  addService: async (data: ServiceFormType): Promise<SResponse> => {
    const res = await api.post<ApiResponse<{ service: Service }>>(SERVICE_API.ROOT, data);
    return {
      message: res.data.message,
      service: res.data.data.service,
    };
  },
  listWorkers: async (
    serviceId: string,
    params: PublicWorkerListParams
  ): Promise<PublicWorkerResponse> => {
    const res = await api.get<ApiResponse<PublicWorkerResponse>>(
      WORKER_API.LIST_BY_SERVICE(serviceId),
      { params }
    );
    return res.data.data;
  },
};

export default ServiceManagement;
