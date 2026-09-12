import { Navigate } from 'react-router-dom';

export default function ProtectedLecturerRoute({ children }) {
  try {
    const raw = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;
    const isLecturer = ['lecturer', 'teacher', 'instructor'].includes(user?.role);

    if (isLecturer) return children;
  } catch {
    // Invalid session data is handled by the dashboard layout.
  }

  return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />;
}
