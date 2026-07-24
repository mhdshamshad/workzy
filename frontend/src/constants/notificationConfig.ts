export interface NotificationConfig {
  icon: string;
  color: string;
}

export const NOTIFICATION_CONFIG: Record<string, NotificationConfig> = {
  // Booking status related
  booking_accepted: { icon: 'CalendarCheck', color: '#10b981' },
  booking_rejected: { icon: 'CalendarX', color: '#ef4444' },
  booking_cancelled: { icon: 'XCircle', color: '#ef4444' },
  booking_expired: { icon: 'Clock', color: '#6b7280' },
  new_booking_request: { icon: 'CalendarPlus', color: '#f59e0b' },

  // Worker job state related
  worker_en_route: { icon: 'Truck', color: '#3b82f6' },
  worker_reached: { icon: 'MapPin', color: '#10b981' },
  job_started: { icon: 'PlayCircle', color: '#10b981' },
  job_completed: { icon: 'CheckCircle', color: '#3b82f6' },
  job_approved: { icon: 'ThumbsUp', color: '#3b82f6' },

  // Pricing / Quote / Charge related
  extra_charge_requested: { icon: 'Receipt', color: '#f59e0b' },
  extra_charge_updated: { icon: 'Receipt', color: '#f59e0b' },
  extra_charge_paid: { icon: 'DollarSign', color: '#10b981' },
  extra_charge_rejected: { icon: 'XCircle', color: '#ef4444' },
  quote_sent: { icon: 'FileText', color: '#3b82f6' },
  quote_accepted: { icon: 'CheckCircle', color: '#10b981' },
  quote_rejected: { icon: 'XCircle', color: '#ef4444' },
  payment_failed: { icon: 'CreditCard', color: '#ef4444' },

  // Disputes related
  booking_disputed: { icon: 'AlertTriangle', color: '#f59e0b' },
  dispute_under_review: { icon: 'Scale', color: '#3b82f6' },
  dispute_dismissed: { icon: 'CheckCircle', color: '#10b981' },
  dispute_resolved: { icon: 'Gavel', color: '#10b981' },

  // Account / Verification related
  account_blocked: { icon: 'Ban', color: '#ef4444' },
  account_unblocked: { icon: 'Unlock', color: '#10b981' },
  worker_verified: { icon: 'ShieldCheck', color: '#10b981' },
  worker_revision: { icon: 'FileWarning', color: '#f59e0b' },
  worker_rejected: { icon: 'ShieldAlert', color: '#ef4444' },

  //worker document verification
  worker_document_verified: { icon: 'ShieldCheck', color: '#10b981' },
  worker_document_rejected: { icon: 'ShieldAlert', color: '#ef4444' },
  worker_document_in_review: { icon: 'FileWarning', color: '#f59e0b' },
};

export function getNotificationConfig(type: string): NotificationConfig {
  return NOTIFICATION_CONFIG[type] ?? { icon: 'Bell', color: '#6366f1' };
}
