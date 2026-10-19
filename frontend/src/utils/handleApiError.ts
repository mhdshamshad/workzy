import axios from 'axios';

import { ApiError } from '@/lib/api/apiError';

export function formatFriendlyErrorMessage(rawMessage: string, statusCode?: number): string {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return 'An unexpected error occurred. Please try again.';
  }

  const lower = rawMessage.toLowerCase();

  if (
    lower.includes('network error') ||
    lower.includes('err_connection_refused') ||
    lower.includes('err_network') ||
    lower.includes('err_name_not_resolved') ||
    lower.includes('err_internet_disconnected') ||
    lower.includes('err_connection_timed_out') ||
    lower.includes('econnrefused') ||
    lower.includes('enotfound') ||
    lower.includes('failed to fetch') ||
    lower.includes('getaddrinfo') ||
    lower.includes('load failed') ||
    lower.includes('unable to connect') ||
    lower.includes('verify the server') ||
    /^err_/i.test(rawMessage.trim())
  ) {
    return 'Service is not responding. Please try again later.';
  }

  if (lower.includes('timeout') || lower.includes('etimedout') || lower.includes('econnaborted')) {
    return 'The server took too long to respond. Please try again later.';
  }

  if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
    return 'Service is temporarily unavailable. Please try again later.';
  }
  if (
    statusCode === 500 &&
    (lower === 'internal server error.' ||
      lower === 'internal server error' ||
      lower === 'service unavailable')
  ) {
    return 'Something went wrong on our end. Please try again later.';
  }

  return rawMessage;
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const msg = error.response?.data?.message || error.response?.data?.error || error.message;
    return formatFriendlyErrorMessage(msg, status);
  }

  if (error instanceof ApiError) {
    return formatFriendlyErrorMessage(error.message, error.statusCode);
  }

  if (error instanceof Error) {
    return formatFriendlyErrorMessage(error.message);
  }

  if (typeof error === 'string') {
    return formatFriendlyErrorMessage(error);
  }

  return 'Something went wrong. Please try again.';
}
