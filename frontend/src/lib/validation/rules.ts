import { z } from 'zod';
export const emailRule = z.string().email('Invalid email format');

export const DESCRIPTION_REGEX =
  /^(?=.*[A-Za-z])(?=.*\S)(?!.*(.)\1{3})[A-Za-z0-9.,—!?&()'"/:%$\s-]+$/;
export const SERVICE_NAME_REGEX =
  /^(?!.*(.)\1{2})(?=.{3,40}$)(?=(?:.*[A-Za-z]){2,})[A-Za-z0-9][A-Za-z0-9/&.'\- ]*[A-Za-z0-9]$/;

export const mongoId = z
  .string('Please Select option')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

export const nameRule = z
  .string()
  .trim()
  .min(3, 'Name must be at least 3 characters')
  .max(30, 'Name cannot exceed 30 characters')
  .regex(/^[A-Za-z ]+$/, 'Name must contain only letters and spaces');

export const passwordRule = z
  .string()
  .trim()
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a symbol')
  .min(8, 'Password must be at least 8 characters');

export const phoneRule = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian phone number');

export const serviceNameRule = z
  .string()
  .trim()
  .min(3, ' name must be at least 3 characters')
  .max(80, ' name cannot exceed 40 characters')
  .regex(SERVICE_NAME_REGEX, 'Invalid name format');
export const descriptionRuleRequired = z
  .string()
  .trim()
  .min(10, 'Description must be at least 10 characters')
  .max(500, 'Description cannot exceed 500 characters')
  .regex(DESCRIPTION_REGEX, 'Description contains invalid characters');

export const descriptionRuleOptional = z
  .string()
  .trim()
  .optional()
  .refine(
    val => !val || (val.trim().length >= 10 && val.trim().length <= 500),
    'Description must be 10–500 characters'
  )
  .refine(
    val => !val || /^[A-Za-z0-9.,!?&_()'"/\-:\s]+$/.test(val),
    'Description contains invalid characters'
  )
  .refine(
    val => !val || !/(.)\1{3}/.test(val),
    "Description cannot contain repeated characters like 'aaaa' or 'ssss'"
  );

export const createDescriptionRule = (
  label: string = 'name',
  required: boolean = true,
  min: number = 10,
  max: number = 500
) => {
  const schema = z
    .string(`${label} is required`)
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} cannot exceed ${max} characters`)
    .regex(DESCRIPTION_REGEX, `${label} contains invalid characters`);

  return required ? schema : schema.or(z.literal('')).optional();
};

export const evidenceItemSchema = z.object({
  url: z.string().url(),
  type: z.enum(['image', 'video']),
});
