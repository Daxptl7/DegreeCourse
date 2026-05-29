import ApiErrorLog from '../models/ApiErrorLog.js';
import AuditLog from '../models/AuditLog.js';
import LoginActivity from '../models/LoginActivity.js';

const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const clone = { ...body };
  delete clone.password;
  delete clone.confirmPassword;
  delete clone.token;
  delete clone.currentPassword;
  delete clone.newPassword;

  return clone;
};

export const getRequestMeta = (req) => ({
  ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
  userAgent: req.get('user-agent') || ''
});

export const logAdminAction = async ({
  actor,
  action,
  module,
  entityType,
  entityId,
  targetLabel = '',
  details = {},
  req
}) => {
  if (!actor) {
    return null;
  }

  try {
    const requestMeta = req ? getRequestMeta(req) : { ipAddress: '', userAgent: '' };

    return await AuditLog.create({
      actor: {
        id: actor._id || actor.id,
        name: actor.name,
        role: actor.role
      },
      action,
      module,
      entityType,
      entityId: String(entityId),
      targetLabel,
      details,
      ...requestMeta
    });
  } catch (error) {
    console.error('Failed to create audit log:', error.message);
    return null;
  }
};

export const logLoginAttempt = async ({
  user,
  email,
  status,
  reason = '',
  suspicious = false,
  detectedRules = [],
  req
}) => {
  try {
    const requestMeta = req ? getRequestMeta(req) : { ipAddress: '', userAgent: '' };

    return await LoginActivity.create({
      user: user?._id,
      email: (email || user?.email || '').toLowerCase(),
      status,
      reason,
      suspicious,
      detectedRules,
      ...requestMeta
    });
  } catch (error) {
    console.error('Failed to create login activity:', error.message);
    return null;
  }
};

export const logApiError = async ({ err, req, statusCode = 500 }) => {
  if (!req?.originalUrl?.startsWith('/api')) {
    return null;
  }

  try {
    const requestMeta = getRequestMeta(req);

    return await ApiErrorLog.create({
      actor: req.user?._id,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      message: err.message || 'Server error',
      stack: err.stack || '',
      requestBody: sanitizeRequestBody(req.body),
      ...requestMeta
    });
  } catch (error) {
    console.error('Failed to create API error log:', error.message);
    return null;
  }
};
