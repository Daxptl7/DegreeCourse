import User from '../models/User.js';
import { APPROVAL_STATUS, USER_STATUS } from '../config/roles.js';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

/**
 * Validates if a user is suspended or a teacher awaiting approval.
 * Returns { isValid: boolean, error: string | null }
 */
const validateUserStatus = (user) => {
  if (user.status === USER_STATUS.SUSPENDED) {
    return { isValid: false, error: 'Your account is suspended' };
  }
  if (user.role === 'teacher' && user.approvalStatus !== APPROVAL_STATUS.APPROVED) {
    return { isValid: false, error: 'Your teacher account is awaiting admin approval' };
  }
  return { isValid: true, error: null };
};

/**
 * Attaches req.user when a valid Bearer token is present; otherwise leaves req.user unset.
 * Used for routes that are public but may expose more data to authenticated users.
 */
export const optionalProtect = async (req, res, next) => {
  req.user = undefined;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return next();
    }

    const userValidation = await User.findById(decoded.id).select('status role approvalStatus');
    if (!userValidation) {
      return next();
    }

    const { isValid } = validateUserStatus(userValidation);
    if (!isValid) {
      return next();
    }

    req.user = userValidation;
    return next();

  } catch (error) {
    return next();
  }
};

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  }

  if (!token) {
    return sendError(res, 401, 'Not authorized to access this route');
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return sendError(res, 401, 'Not authorized to access this route');
    }

    // Optimize: Only fetch essential fields for validation to reduce database payload and latency
    const user = await User.findById(decoded.id).select('status role approvalStatus');

    if (!user) {
      return sendError(res, 401, 'Not authorized to access this route');
    }

    const { isValid, error } = validateUserStatus(user);
    if (!isValid) {
      return sendError(res, 403, error);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, 'Not authorized to access this route');
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, `User role ${req.user?.role} is not authorized to access this route`);
    }
    next();
  };
};

export const authMiddleware = protect;
