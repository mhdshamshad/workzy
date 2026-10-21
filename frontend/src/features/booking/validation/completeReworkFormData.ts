import { z } from 'zod';

import { createDescriptionRule, evidenceItemSchema } from '@/lib/validation/rules';

export const completeReworkFormData = z.object({
  otp: z
    .string()
    .trim()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
  workerNote: createDescriptionRule('Resolution notes', false, 5, 500),
  completionEvidence: z
    .array(evidenceItemSchema)
    .min(1, 'At least one completion proof is required'),
});

export type CompleteReworkFormType = z.infer<typeof completeReworkFormData>;
