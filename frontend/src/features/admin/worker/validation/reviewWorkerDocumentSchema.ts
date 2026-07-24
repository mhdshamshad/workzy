import z from 'zod';

import { DOCUMENT_STATUS } from '@/constants';
import { createDescriptionRule, mongoId } from '@/lib/validation/rules';

export const reviewWorkerDocumentSchema = z
  .object({
    id: mongoId,
    status: z.enum([DOCUMENT_STATUS.IN_REVIEW, DOCUMENT_STATUS.VERIFIED, DOCUMENT_STATUS.REJECTED]),
    rejectReason: createDescriptionRule('Reason', false),
  })
  .superRefine((data, ctx) => {
    if (data.status === DOCUMENT_STATUS.REJECTED && !data.rejectReason) {
      ctx.addIssue({
        code: 'custom',
        path: ['rejectReason'],
        message: 'Rejection reason is required',
      });
    }
  });

export type ReviewWorkerDocumentSchemaType = z.infer<typeof reviewWorkerDocumentSchema>;
