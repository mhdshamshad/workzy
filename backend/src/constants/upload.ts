export const FILE_TYPES = {
  IMAGES: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/jpg"],

  DOCUMENTS: ["application/pdf", "application/msword", "image/jpeg", "image/png"],

  VIDEOS: ["video/mp4", "video/webm", "video/quicktime"],

  AUDIOS: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm"],
} as const;

export const PURPOSE_POLICY = {
  PROFILE_IMAGE: {
    folder: "private/user/profiles",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },

  CATEGORY_ICON: {
    folder: "public/categories/icons",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },

  CATEGORY_IMAGE: {
    folder: "public/categories/images",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },

  WORKER_DOCUMENT: {
    folder: "private/worker/documents",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },

  WORKER_COVER_IMAGE: {
    folder: "public/worker/coverImages",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },
  WORKER_PROFILE_IMAGE: {
    folder: "public/worker/profiles",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },

  HOME_BANNER_IMAGE: {
    folder: "public/home/banners",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },

  HOME_HOW_IT_WORKS_IMAGE: {
    folder: "public/home/how-it-works",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },

  HOME_WHY_CHOOSE_IMAGE: {
    folder: "public/home/why-choose",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },

  HOME_TESTIMONIAL_IMAGE: {
    folder: "public/home/testimonials",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },
  SERVICE_EVIDENCE: {
    folder: "public/bookings/evidence",
    maxSizeMB: 50,
    allowedTypes: [...FILE_TYPES.IMAGES, ...FILE_TYPES.VIDEOS],
  },
  REVIEW_EVIDENCE: {
    folder: "public/bookings/reviews",
    maxSizeMB: 50,
    allowedTypes: [...FILE_TYPES.IMAGES, ...FILE_TYPES.VIDEOS],
  },
  DISPUTE_EVIDENCE: {
    folder: "public/bookings/disputes",
    maxSizeMB: 50,
    allowedTypes: [...FILE_TYPES.IMAGES, ...FILE_TYPES.VIDEOS],
  },

  CHAT_IMAGE: {
    folder: "private/chat/images",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },

  CHAT_VIDEO: {
    folder: "private/chat/videos",
    maxSizeMB: 50,
    allowedTypes: FILE_TYPES.VIDEOS,
  },

  CHAT_AUDIO: {
    folder: "private/chat/audio",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.AUDIOS,
  },

  PAYOUT_RECEIPT: {
    folder: "private/payouts/receipts",
    maxSizeMB: 10,
    allowedTypes: FILE_TYPES.IMAGES,
  },
} as const;

export type UploadPurpose = keyof typeof PURPOSE_POLICY;
export const UploadPurposes = Object.keys(PURPOSE_POLICY);
