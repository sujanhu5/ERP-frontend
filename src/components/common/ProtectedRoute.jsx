import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';

/** Where a signed-in user belongs when they land somewhere they shouldn't. */
export const homeFor = (user) => (user?.role === 'platform_owner' ? '/platform' : '/dashboard');

/**
 * Wraps routes that require authentication. Optionally restricts to
 * specific roles via `roles={['admin','manager']}`.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-canvas">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Send people to their own home rather than a page they can't use — the
  // platform owner has no organization, so tenant routes would 403 for them.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeFor(user)} replace />;
  }

  return children;
}
