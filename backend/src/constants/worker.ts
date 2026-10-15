export const WORKER_STATUS = {
  PENDING: "pending",
  IN_REVIEW: "in_review",
  VERIFIED: "verified",
  REJECTED: "rejected",
  NEEDS_REVISION: "needs_revision",
  SUSPENDED: "suspended",
} as const;
export type WorkerStatus = (typeof WORKER_STATUS)[keyof typeof WORKER_STATUS];

export const ACTIVE_WORKER_STATUSES: WorkerStatus[] = [
  WORKER_STATUS.VERIFIED,
  WORKER_STATUS.SUSPENDED,
];

export const DOCUMENT_TYPE = {
  // Identity & KYC (Standard Base)
  AADHAAR: "aadhaar",
  PAN: "pan",
  PROFILE_PHOTO: "profile_photo",
  SELFIE_VERIFICATION: "selfie_verification",

  // Trust & Safety
  POLICE_CLEARANCE: "police_clearance",
  INSURANCE: "insurance",

  // Technical & Home Maintenance (Category Gating)
  ELECTRICAL_LICENSE: "electrical_license",
  HVAC_AC_CERTIFICATE: "hvac_ac_certificate",
  PLUMBING_CERTIFICATE: "plumbing_certificate",
  REFRIGERATION_CERTIFICATE: "refrigeration_certificate",
  APPLIANCE_REPAIR_CERTIFICATE: "appliance_repair_certificate",
  RO_WATER_PURIFIER_CERTIFICATE: "ro_water_purifier_certificate",
  CARPENTRY_CERTIFICATE: "carpentry_certificate",

  // Personal Care, Salon & Wellness (Future Services)
  BEAUTY_HAIR_CERTIFICATE: "beauty_hair_certificate",
  MASSAGE_THERAPIST_LICENSE: "massage_therapist_license",

  // Driving & Logistics (Future Services)
  DRIVING_LICENSE: "driving_license",

  // Culinary & Food (Future Services)
  FOOD_HANDLING_CERTIFICATE: "food_handling_certificate",

  // Safety & Security (Future Services)
  PEST_CONTROL_LICENSE: "pest_control_license",
  CCTV_SECURITY_CERTIFICATE: "cctv_security_certificate",

  // General & Business
  TRADE_CERTIFICATE: "trade_certificate",
  SKILL_CERTIFICATE: "skill_certificate",
  EXPERIENCE_LETTER: "experience_letter",
  PROFESSIONAL_LICENSE: "professional_license",
  GST_CERTIFICATE: "gst_certificate",
  BUSINESS_REGISTRATION: "business_registration",
  OTHER: "other",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPE)[keyof typeof DOCUMENT_TYPE];

export const DOCUMENT_STATUS = {
  PENDING: "pending",
  IN_REVIEW: "in_review",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type DocumentStatus = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

export const WORKER_JOIN_DOCUMENT_KEY_MAP = {
  aadhaar: DOCUMENT_TYPE.AADHAAR,
  pan: DOCUMENT_TYPE.PAN,
  selfie: DOCUMENT_TYPE.SELFIE_VERIFICATION,
  profile: DOCUMENT_TYPE.PROFILE_PHOTO,
} as const;
