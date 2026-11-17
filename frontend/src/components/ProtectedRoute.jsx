import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({ children, admin = false }) {
  const { user, checking } = useAuth();
  if (checking) return <div className="loading-screen">Loading your workspace…</div>;
  if (!user) return <Navigate to="/login" replace/>;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace/>;
  return children;
}
