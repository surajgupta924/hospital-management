import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.jwt.accessSecret);
    const user = await User.findById(decoded.id).populate('hospital', 'name slug isActive');

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    if (user.hospital && !user.hospital.isActive && user.role !== 'super_admin') {
      throw new ApiError(403, 'Hospital account is suspended');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid or expired token');
  }
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, env.jwt.accessSecret);
      const user = await User.findById(decoded.id).populate('hospital', 'name slug isActive');
      if (user?.isActive) req.user = user;
    } catch {
      // optional auth - ignore invalid tokens
    }
  }
  next();
});
