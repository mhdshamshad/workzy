import { z } from 'zod';

export const bankDetailsSchema = z.object({
  accountHolderName: z.string().regex(/^[a-zA-Z\s.]{3,60}$/, {
    message: 'Account holder name must be 3-60 characters and contain only letters',
  }),
  accountNumber: z.string().regex(/^\d{9,18}$/, {
    message: 'Account number must be 9 to 18 numeric digits',
  }),
  ifscCode: z
    .string()
    .transform(v => v.trim().toUpperCase())
    .pipe(
      z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
        message: 'Invalid IFSC format (e.g. SBIN0001234)',
      })
    ),
  bankName: z.string().regex(/^[a-zA-Z0-9\s.&'-]{3,60}$/, {
    message: 'Bank name must be between 3 and 60 characters',
  }),
});

export const upiDetailsSchema = z.object({
  upiId: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/, {
      message: 'Invalid UPI ID format (e.g. worker@okaxis or 9876543210@upi)',
    }),
});

export type BankDetailsFormType = z.infer<typeof bankDetailsSchema>;
export type UpiDetailsFormType = z.infer<typeof upiDetailsSchema>;
