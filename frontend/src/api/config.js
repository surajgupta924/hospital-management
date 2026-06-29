const normalizeApiBaseUrl = (rawUrl) => {
  const fallback = '/api/v1';

  if (!rawUrl || !rawUrl.trim()) {
    return fallback;
  }

  const trimmed = rawUrl.trim();

  // Relative URL (local dev proxy)
  if (!trimmed.startsWith('http')) {
    return trimmed.replace(/\/+$/, '') || fallback;
  }

  try {
    const parsed = new URL(trimmed);
    const path = parsed.pathname.replace(/\/+$/, '');

    if (!path || path === '') {
      parsed.pathname = '/api/v1';
    } else if (!path.endsWith('/api/v1')) {
      parsed.pathname = `${path}/api/v1`;
    }

    return `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
  } catch {
    return fallback;
  }
};

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export const buildApiUrl = (path = '') => {
  const cleanPath = String(path).replace(/^\/+/, '');
  return cleanPath ? `${API_BASE_URL}/${cleanPath}` : API_BASE_URL;
};

export const isProductionMisconfigured = () =>
  import.meta.env.PROD && !import.meta.env.VITE_API_URL;
