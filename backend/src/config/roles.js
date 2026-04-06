export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MODERATOR];

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive'
};

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const COURSE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived'
};

export const LECTURE_STATUS = {
  LOCKED: 'locked',
  UNLOCKED: 'unlocked'
};

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

export const canManageUsers = (role) => [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role);

export const canManagePlatformConfig = (role) => role === ROLES.SUPER_ADMIN;
