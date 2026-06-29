const isProduction = process.env.NODE_ENV === 'production';

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearRefreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'strict',
};
