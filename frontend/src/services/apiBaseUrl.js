// Normalizes VITE_API_URL so a misconfigured env var (e.g. missing the
// trailing /api, or with a trailing slash) can't silently break every
// request. Always resolves to something ending in exactly one "/api".
function resolveApiBaseUrl() {
  const raw = (import.meta.env.VITE_API_URL || '/api').trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, '');
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();
