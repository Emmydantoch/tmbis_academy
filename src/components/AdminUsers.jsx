import { useEffect, useState } from 'react';
import api from '../api/axios';
import SidebarLayout from './SidebarLayout';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total_users: 0, active_students: 0, staff: 0, admins: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('auth/admin-users/');
        setUsers(response.data.users || []);
        setSummary(response.data.summary || { total_users: 0, active_students: 0, staff: 0, admins: 0 });
        setError('');
      } catch (err) {
        console.error('Failed to load users:', err);
        setError('Unable to load live user data right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    const intervalId = setInterval(fetchUsers, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navItems = [
    { icon: 'home', label: 'Home', to: '/' },
    { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
    { icon: 'people', label: 'Users', to: '/admin/users', active: true },
    { icon: 'school', label: 'Courses', to: '/admin/courses' },
    { icon: 'account_balance_wallet', label: 'Payments', to: '/admin/payments' },
    { icon: 'assessment', label: 'Reports', to: '/admin/reports' },
  ];

  return (
    <SidebarLayout
      title="TMBIS Academy"
      subtitle="Admin Portal"
      headerTitle="Users"
      navItems={navItems}
      showSearch
      searchPlaceholder="Search users, roles, or email..."
      headerActions={
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-72 rounded-full border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 focus:border-primary focus:outline-none"
          />
        </div>
      }
    >
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <MiniStat label="Total Users" value={loading ? '…' : formatNumber(summary.total_users)} />
          <MiniStat label="Active Students" value={loading ? '…' : formatNumber(summary.active_students)} />
          <MiniStat label="Staff" value={loading ? '…' : formatNumber(summary.staff)} />
          <MiniStat label="Admins" value={loading ? '…' : formatNumber(summary.admins)} />
        </div>

        <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Name</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Email</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Role</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Semester</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-high transition-colors">
                  <td className="px-6 py-5 font-medium text-on-surface">{user.name}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.email}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      user.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.semester}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{formatDate(user.joined_at)}</td>
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

function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-NG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
