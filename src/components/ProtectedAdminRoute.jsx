// src/components/ProtectedAdminRoute.jsx
import { Navigate } from 'react-router-dom';

/**
 * Wraps a route so only admin users can access it.
 * Checks localStorage for user.is_admin, user.role === 'admin',
 * or user.is_staff — whichever your backend returns.
 * Non-admins are redirected back to /dashboard.
 */
export default function ProtectedAdminRoute({ children }) {
  let isAdmin = false;

  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user = JSON.parse(raw);
      // Support multiple common backend field conventions
      isAdmin =
        user.is_admin === true ||
        user.is_staff === true ||
        user.role === 'admin' ||
        user.role === 'superuser';
    }
  } catch {
    isAdmin = false;
  }

  if (!isAdmin) {
    // Redirect non-admins to the student dashboard
    return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />;
  }

  return children;
}
