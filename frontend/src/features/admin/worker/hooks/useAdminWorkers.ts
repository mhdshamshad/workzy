import { useQuery } from '@tanstack/react-query';

import AdminWorkerService from '@/services/admin/workerManagement.service';
import type { AdminWorkerListQuery } from '@/types/admin/worker';

export function useAdminWorkers({
  page,
  limit,
  search,
  status = 'all',
  payoutStatus = 'all',
}: AdminWorkerListQuery) {
  const query = useQuery({
    queryKey: ['admin-workers', page, limit, search ?? '', status ?? 'all', payoutStatus ?? 'all'],
    queryFn: () =>
      AdminWorkerService.ListWorkers({ page: page + 1, limit, search, status, payoutStatus }),
    placeholderData: prev => prev,
  });

  return {
    workers: query.data?.workers ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
