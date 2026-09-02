import { useEffect, useState } from 'react';
import api from '../api/axios';
import SidebarLayout from './SidebarLayout';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState({ total_programs: 0, total_applications: 0, accepted: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('admin-courses/');
        setCourses(response.data.courses || []);
        setSummary(response.data.summary || { total_programs: 0, total_applications: 0, accepted: 0, pending: 0 });
        setError('');
      } catch (err) {
        console.error('Failed to load course stats:', err);
        setError('Unable to load live course stats right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    const intervalId = setInterval(fetchCourses, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const navItems = [
    { icon: 'home', label: 'Home', to: '/' },
    { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
    { icon: 'people', label: 'Users', to: '/admin/users' },
    { icon: 'school', label: 'Courses', to: '/admin/courses', active: true },
    { icon: 'account_balance_wallet', label: 'Payments', to: '/admin/payments' },
    { icon: 'assessment', label: 'Reports', to: '/admin/reports' },
  ];

  return (
    <SidebarLayout
      title="TMBIS Academy"
      subtitle="Admin Portal"
      headerTitle="Courses"
      navItems={navItems}
      showSearch
      searchPlaceholder="Search courses..."
    >
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <MiniStat label="Programs" value={loading ? '…' : formatNumber(summary.total_programs)} />
          <MiniStat label="Applications" value={loading ? '…' : formatNumber(summary.total_applications)} />
          <MiniStat label="Accepted" value={loading ? '…' : formatNumber(summary.accepted)} />
          <MiniStat label="Pending" value={loading ? '…' : formatNumber(summary.pending)} />
        </div>

        <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Program</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Applications</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Accepted</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Pending</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {courses.map((course) => (
                <tr key={course.name} className="hover:bg-surface-container-high transition-colors">
                  <td className="px-6 py-5 font-medium text-on-surface">{course.name}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{course.applications}</td>
                  <td className="px-6 py-5 text-primary">{course.accepted}</td>
                  <td className="px-6 py-5 text-secondary">{course.pending}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {course.completion_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-surface-container p-6 rounded-3xl border-l-4 border-primary">
      <p className="text-xs uppercase tracking-widest text-on-surface-variant">{label}</p>
      <p className="mt-3 text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}
