import { useMutation, useQueryClient } from '@tanstack/react-query';

import AdminWorkerService from '@/services/admin/workerManagement.service';

import type { ReviewWorkerDocumentSchemaType } from '../validation/reviewWorkerDocumentSchema';

export function useReviewWorkerDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workerId, data }: { workerId: string; data: ReviewWorkerDocumentSchemaType }) =>
      AdminWorkerService.reviewWorkerDocument(workerId, data),
    onSuccess: (_, { workerId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-workers'] });
      queryClient.invalidateQueries({ queryKey: ['worker', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['worker', workerId, 'profile-details'] });
    },
  });
}
