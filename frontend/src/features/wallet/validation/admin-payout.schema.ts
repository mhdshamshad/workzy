import z from 'zod';

export const approvePayoutSchema = z.object({
  referenceId: z.string().regex(/^[a-zA-Z0-9\-_]{6,40}$/, {
    message: 'Reference ID / UTR must be 6 to 40 alphanumeric characters',
  }),
  receiptUrl: z.string().url({ message: 'Invalid URL' }),
});

export type ApprovePayoutFormType = z.infer<typeof approvePayoutSchema>;

export const rejectPayoutSchema = z.object({
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(1000, 'Reason must not exceed 1000 characters'),
});

export type RejectPayoutFormType = z.infer<typeof rejectPayoutSchema>;
