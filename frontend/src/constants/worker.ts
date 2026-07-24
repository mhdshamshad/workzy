import { BadgeCheck, Ban, Clock3, RefreshCcw, SearchCheck, XCircle } from 'lucide-react';

export const STRIPE_ACCOUNT_STATUS = {
  NOT_CONNECTED: 'not_connected',
  PENDING: 'pending',
  ACTIVE: 'active',
} as const;
export type StripeAccountStatus =
  (typeof STRIPE_ACCOUNT_STATUS)[keyof typeof STRIPE_ACCOUNT_STATUS];

export const WORKER_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  NEEDS_REVISION: 'needs_revision',
  SUSPENDED: 'suspended',
} as const;
export type WorkerStatus = (typeof WORKER_STATUS)[keyof typeof WORKER_STATUS];

export const ACTIVE_WORKER_STATUSES: WorkerStatus[] = [
  WORKER_STATUS.VERIFIED,
  WORKER_STATUS.SUSPENDED,
];

export const DOCUMENT_TYPE = {
  AADHAAR: 'aadhaar',
  PAN: 'pan',
  PROFILE_PHOTO: 'profile_photo',
  SELFIE_VERIFICATION: 'selfie_verification',

  // Professional
  TRADE_CERTIFICATE: 'trade_certificate',
  SKILL_CERTIFICATE: 'skill_certificate',
  EXPERIENCE_LETTER: 'experience_letter',
  PROFESSIONAL_LICENSE: 'professional_license',

  // Trust & Safety
  POLICE_CLEARANCE: 'police_clearance',
  INSURANCE: 'insurance',

  // Business
  GST_CERTIFICATE: 'gst_certificate',
  BUSINESS_REGISTRATION: 'business_registration',

  // Misc
  OTHER: 'other',
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

export const WORKER_STATUS_CONFIG: Record<
  WorkerStatus,
  {
    label: string;
    description: string;
    icon: typeof BadgeCheck;
    badgeVariant: 'green' | 'red' | 'amber' | 'blue' | 'slate';
    bannerClass: string;
    iconClass: string;
  }
> = {
  [WORKER_STATUS.PENDING]: {
    label: 'Pending Review',
    description:
      'This application is awaiting initial review. Please inspect all mandatory documents below.',
    icon: Clock3,
    badgeVariant: 'blue',
    bannerClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    iconClass: 'text-blue-600',
  },

  [WORKER_STATUS.IN_REVIEW]: {
    label: 'Under Review',
    description:
      'This application is currently marked in review. Check all credentials and upload quality.',
    icon: SearchCheck,
    badgeVariant: 'amber',
    bannerClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    iconClass: 'text-amber-600',
  },

  [WORKER_STATUS.VERIFIED]: {
    label: 'Verified',
    description: 'This worker has been successfully verified.',
    icon: BadgeCheck,
    badgeVariant: 'green',
    bannerClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    iconClass: 'text-emerald-600',
  },

  [WORKER_STATUS.NEEDS_REVISION]: {
    label: 'Resubmission Requested',
    description: '',
    icon: RefreshCcw,
    badgeVariant: 'amber',
    bannerClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    iconClass: 'text-orange-600',
  },

  [WORKER_STATUS.REJECTED]: {
    label: 'Application Rejected',
    description: '',
    icon: XCircle,
    badgeVariant: 'red',
    bannerClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    iconClass: 'text-red-600',
  },

  [WORKER_STATUS.SUSPENDED]: {
    label: 'Suspended',
    description: 'This worker account has been suspended.',
    icon: Ban,
    badgeVariant: 'slate',
    bannerClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    iconClass: 'text-slate-600',
  },
};
