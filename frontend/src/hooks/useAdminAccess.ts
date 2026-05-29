import { useAuth } from '../context/AuthContext';

const ADMIN_ROLES = ['super_admin', 'admin', 'moderator'];

export const useAdminAccess = () => {
  const { user, loading } = useAuth();
  const role = user?.role || '';

  return {
    user,
    loading,
    isAdmin: ADMIN_ROLES.includes(role),
    isSuperAdmin: role === 'super_admin',
    canManageUsers: ['super_admin', 'admin'].includes(role),
    canModerate: ['super_admin', 'admin', 'moderator'].includes(role),
    canManageAnnouncements: ['super_admin', 'admin'].includes(role),
    canManageSettings: role === 'super_admin'
  };
};

export default useAdminAccess;
