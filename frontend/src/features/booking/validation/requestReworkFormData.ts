import { z } from 'zod';

import { createDescriptionRule, evidenceItemSchema } from '@/lib/validation/rules';

export const requestReworkFormData = z.object({
  reason: createDescriptionRule('Reason', true, 5, 500),
  preferredDate: z.string().optional(),
  evidence: z
    .array(evidenceItemSchema)
    .min(1, 'At least one photo or video is required as evidence'),
});

export type RequestReworkFormType = z.infer<typeof requestReworkFormData>;
