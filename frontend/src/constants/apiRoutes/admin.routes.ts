import { buildRoute } from './routeBuilder';

const admin = buildRoute('/admin');

export const ADMIN_API = {
  USER: {
    USERS: admin(`/users`),
    USER_DETAILS: (id: string) => admin(`/users/${id}`),
    USER_STATS: (id: string) => admin(`/users/${id}/stats`),
    USER_STATUS: (id: string) => admin(`/users/${id}/toggle-status`),
  },
  CATEGORY: {
    CATEGORIES: admin(`/categories/add`),
    CATEGORY_BY_ID: (id: string) => admin(`/categories/edit/${id}`),
    CATEGORY_STATUS: (id: string) => admin(`/categories/toggle-status/${id}`),
  },
  WORKER: {
    WORKERS: admin(`/workers`),
    REVIEW: (id: string) => admin(`/workers/${id}/review`),
    REVIEW_DOCUMENT: (workerId: string, documentId: string) =>
      admin(`/workers/${workerId}/documents/${documentId}/review`),
    STATUS_CHANGE: (id: string) => admin(`/workers/${id}/status`),
    STATS: (id: string) => admin(`/workers/${id}/stats`),
    SERVICES: (id: string) => admin(`/workers/${id}/services`),
    SERVICE_CATEGORIES: (id: string) => admin(`/workers/${id}/service-categories`),
  },
  BOOKING: {
    ROOT: admin('/bookings/'),
    BY_ID: (id: string) => admin(`/bookings/${id}`),
  },
  DASHBOARD: admin('dashboard'),
  PAYOUT: {
    ROOT: admin('/payouts'),
    STATS: admin('/payouts/stats'),
    APPROVE: (id: string) => admin(`/payouts/${id}/approve`),
    REJECT: (id: string) => admin(`/payouts/${id}/reject`),
    METHOD_VERIFY: (id: string, method: string) =>
      admin(`/payouts/${id}/payout-settings/${method}/verify`),
    METHOD_REJECT: (id: string, method: string) =>
      admin(`/payouts/${id}/payout-settings/${method}/reject`),
  },
  WORKER_WALLET: {
    ROOT: (workerId: string) => admin(`/workers/${workerId}/wallet`),
    TRANSACTIONS: (workerId: string) => admin(`/workers/${workerId}/wallet/transactions`),
  },
} as const;
