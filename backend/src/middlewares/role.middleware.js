import { sendError } from '../utils/response.js';

export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `User role ${req.user.role} is not authorized to access this route`);
    }

    next();
  };
};

export default roleMiddleware;
