import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({ hospital, user, action, resource, resourceId, details, req }) => {
  try {
    await AuditLog.create({
      hospital: hospital || user?.hospital,
      user: user._id || user,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req?.ip || req?.headers?.['x-forwarded-for'],
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
};

export default logAudit;
