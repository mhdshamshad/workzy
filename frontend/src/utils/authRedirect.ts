export const AUTH_REDIRECT_STORAGE_KEY = 'workzy_auth_redirect';

export function getInternalRedirectPath(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return undefined;
  }

  return value;
}
