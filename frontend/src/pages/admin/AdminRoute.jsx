import { Navigate, useLocation } from 'react-router-dom';
import useAdminAccess from '../../hooks/useAdminAccess';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  const { isAdmin, loading } = useAdminAccess();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-200">
        Loading admin access...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default AdminRoute;
