export const REDIS_KEYS = {
  // Presence
  PRESENCE: {
    ONLINE: "presence:online",
    LAST_SEEN: "presence:lastSeen",
  },

  // Categories
  CATEGORY: {
    LIST: (parentId: string | null, status: string, page: number, limit: number, search?: string) =>
      `categories:list:${parentId || "root"}:${status}:${page}:${limit}:${search || "all"}`,

    TRENDING: (limit: number) => `categories:trending:${limit}`,

    PUBLIC_SERVICES: (categoryId: string | null, limit: number, sortBy: string, cursor?: string) =>
      `public:services:${categoryId || "all"}:${limit}:${sortBy || "newest"}:${cursor || "none"}`,

    LIST_PREFIX: "categories:list",

    TRENDING_PREFIX: "categories:trending",

    PUBLIC_SERVICES_PREFIX: "public:services",
  },

  // OTP
  OTP: {
    EMAIL: (email: string) => `otp:email:${email}`,

    PHONE: (phone: string) => `otp:phone:${phone}`,
  },

  // Booking
  BOOKING: {
    OTP: (bookingId: string) => `booking-otp:${bookingId}`,
    DAY_OTP: (bookingId: string, dayIndex: number) => `booking-day-otp:${bookingId}:${dayIndex}`,
  },

  AUTH: {
    OTP: (email: string) => `otp:${email}`,
    FORGOT_PASSWORD: (email: string) => `forgotPassword:${email}`,
    BLOCKED_USER: (userId: string) => `blocked_user:${userId}`,
  },
} as const;
