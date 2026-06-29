import env from '../config/env.js';

const normalizeOrigin = (origin) => origin?.replace(/\/$/, '');

export const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  const allowed = env.clientUrls.some((url) => normalizeOrigin(url) === normalized);

  if (allowed) return true;

  // Allow Vercel production + preview deployments
  if (/^https:\/\/[\w-]+\.vercel\.app$/i.test(origin)) return true;

  return false;
};

export const corsOriginHandler = (origin, callback) => {
  if (isOriginAllowed(origin)) {
    callback(null, origin || env.clientUrls[0]);
    return;
  }

  console.warn(`CORS blocked origin: ${origin}`);
  callback(null, false);
};
