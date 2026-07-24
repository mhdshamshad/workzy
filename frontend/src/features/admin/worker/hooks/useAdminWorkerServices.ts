import { useInfiniteQuery, useQuery, type InfiniteData } from '@tanstack/react-query';

import AdminWorkerService from '@/services/admin/workerManagement.service';
import type { ServiceFilters, WorkerServicesResponse } from '@/types/service';

export function useAdminWorkerServices(
  workerId: string,
  filters: Omit<ServiceFilters, 'cursor' | 'limit'>
) {
  return useInfiniteQuery<
    WorkerServicesResponse,
    Error,
    InfiniteData<WorkerServicesResponse>,
    [string, string, typeof filters],
    string | undefined
  >({
    queryKey: ['admin-worker-services', workerId, filters],
    queryFn: ({ pageParam }) =>
      AdminWorkerService.getWorkerServices(workerId, {
        ...filters,
        cursor: pageParam,
        limit: 9,
      }),
    initialPageParam: undefined,
    getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    enabled: !!workerId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminWorkerServiceCategories(workerId?: string) {
  const query = useQuery({
    queryKey: ['admin-worker-service-categories', workerId],
    queryFn: () => AdminWorkerService.getWorkerServiceCategories(workerId!),
    enabled: !!workerId,
    gcTime: 1000 * 60 * 10,
    staleTime: 1000 * 60 * 5,
  });
  return {
    categories: query.data?.categories ?? [],
    isLoading: query.isLoading,
  };
}
