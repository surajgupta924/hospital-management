import crypto from 'crypto';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import RefreshToken from '../models/RefreshToken.js';
import ApiError from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtils.js';
import { ROLES } from '../constants/roles.js';
import { logAudit } from './auditService.js';
import env from '../config/env.js';

const getTokenPayload = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  hospital: user.hospital?._id || user.hospital,
});

const saveRefreshToken = async (userId, token, req) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({
    user: userId,
    token,
    expiresAt,
    userAgent: req?.headers?.['user-agent'],
    ipAddress: req?.ip,
  });
};

export const register = async (data, req) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new ApiError(409, 'Email already registered');

  let hospital = null;
  let role = data.role || ROLES.PATIENT;

  if (data.hospitalName && data.hospitalSlug) {
    const slugExists = await Hospital.findOne({ slug: data.hospitalSlug });
    if (slugExists) throw new ApiError(409, 'Hospital slug already taken');

    hospital = await Hospital.create({
      name: data.hospitalName,
      slug: data.hospitalSlug,
      email: data.email,
      phone: data.phone || 'N/A',
    });
    role = ROLES.HOSPITAL_ADMIN;
  }

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role,
    hospital: hospital?._id,
  });

  await logAudit({
    hospital: hospital?._id,
    user,
    action: 'CREATE',
    resource: 'User',
    resourceId: user._id,
    details: { role },
    req,
  });

  const accessToken = generateAccessToken(getTokenPayload(user));
  const refreshToken = generateRefreshToken({ id: user._id });
  await saveRefreshToken(user._id, refreshToken, req);

  const populatedUser = await User.findById(user._id).populate('hospital', 'name slug');

  return { user: populatedUser, accessToken, refreshToken };
};

export const login = async ({ email, password }, req) => {
  const user = await User.findOne({ email }).select('+password').populate('hospital', 'name slug isActive');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(getTokenPayload(user));
  const refreshToken = generateRefreshToken({ id: user._id });
  await saveRefreshToken(user._id, refreshToken, req);

  await logAudit({ user, action: 'LOGIN', resource: 'Auth', req });

  return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (token, req) => {
  if (!token) throw new ApiError(401, 'Refresh token required');

  const decoded = verifyRefreshToken(token);
  const stored = await RefreshToken.findOne({ token, isRevoked: false });

  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).populate('hospital', 'name slug');
  if (!user?.isActive) throw new ApiError(401, 'User not found or inactive');

  const accessToken = generateAccessToken(getTokenPayload(user));
  const newRefreshToken = generateRefreshToken({ id: user._id });

  stored.isRevoked = true;
  await stored.save();
  await saveRefreshToken(user._id, newRefreshToken, req);

  return { accessToken, refreshToken: newRefreshToken };
};

export const logout = async (token, user, req) => {
  if (token) {
    await RefreshToken.updateOne({ token }, { isRevoked: true });
  }
  await logAudit({ user, action: 'LOGOUT', resource: 'Auth', req });
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return { message: 'If email exists, reset link has been sent' };

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;

  // In production, send email via nodemailer
  if (env.nodeEnv === 'development') {
    console.log(`Password reset URL: ${resetUrl}`);
  }

  return { message: 'If email exists, reset link has been sent', ...(env.nodeEnv === 'development' && { resetUrl }) };
};

export const resetPassword = async ({ token, password }) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });

  return { message: 'Password reset successful' };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).populate('hospital', 'name slug settings');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};
