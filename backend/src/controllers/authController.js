import * as authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, req);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json(new ApiResponse(201, { user: result.user, accessToken: result.accessToken }, 'Registration successful'));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json(new ApiResponse(200, { user: result.user, accessToken: result.accessToken }, 'Login successful'));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const result = await authService.refreshAccessToken(token, req);
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json(new ApiResponse(200, result, 'Token refreshed'));
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  await authService.logout(token, req.user, req);
  res.clearCookie('refreshToken');
  res.json(new ApiResponse(200, null, 'Logout successful'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json(new ApiResponse(200, result, result.message));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.json(new ApiResponse(200, result, result.message));
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  res.json(new ApiResponse(200, user));
});
