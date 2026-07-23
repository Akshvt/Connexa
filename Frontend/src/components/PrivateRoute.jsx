import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  // Don't redirect while we're still restoring the session from localStorage
  if (loading) return null;

  if (!token) return <Navigate to="/login" replace />;
  return children;
}
