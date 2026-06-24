import ApiError from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }

  next();
};

export const authorizeHospitalAccess = (req, res, next) => {
  const { user } = req;
  const hospitalId = req.params.hospitalId || req.body.hospital || req.query.hospital;

  if (user.role === ROLES.SUPER_ADMIN) {
    return next();
  }

  if (!user.hospital) {
    return next(new ApiError(403, 'No hospital associated with your account'));
  }

  if (hospitalId && user.hospital._id.toString() !== hospitalId.toString()) {
    return next(new ApiError(403, 'Access denied to this hospital'));
  }

  req.hospitalId = user.hospital._id || user.hospital;
  next();
};

export const setTenantContext = (req, res, next) => {
  if (req.user.role === ROLES.SUPER_ADMIN) {
    req.hospitalId = req.params.hospitalId || req.query.hospitalId || req.body.hospital || null;
  } else {
    req.hospitalId = req.user.hospital?._id || req.user.hospital;
    if (!req.hospitalId) {
      return next(new ApiError(403, 'Hospital context required'));
    }
  }
  next();
};
