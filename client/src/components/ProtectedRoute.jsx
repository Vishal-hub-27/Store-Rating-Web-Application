import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, homePathFor } from '../context/AuthContext';
import Loader from './Loader';

// Wrap a page with this to require login and (optionally) a specific role.
// <ProtectedRoute role="owner"><OwnerDashboard /></ProtectedRoute>
function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  // Not logged in -> go to login
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  // Logged in but wrong role -> send them to their own home page
  if (role && user.role !== role) return <Navigate to={homePathFor(user.role)} replace />;

  return children;
}

export default ProtectedRoute;
