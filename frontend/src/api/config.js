const normalizeApiBaseUrl = (rawUrl) => {
  const fallback = '/api/v1';
  if (!rawUrl) return fallback;

  let url = rawUrl.trim().replace(/\/+$/, '');

  // Auto-append /api/v1 when only the Render host is provided
  if (url.startsWith('http') && !url.includes('/api/v1')) {
    url = `${url}/api/v1`;
  }

  return url;
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
