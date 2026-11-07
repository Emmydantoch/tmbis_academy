import { useEffect, useState } from 'react';
import api from '../api/axios';
import SidebarLayout from './SidebarLayout';

export default function AdminUsers() {
  const adminBackendUrl = new URL('/admin/', api.defaults.baseURL).toString();
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total_users: 0, active_students: 0, lecturers: 0, staff: 0, admins: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('auth/admin-users/');
        setUsers(response.data.users || []);
        setSummary(response.data.summary || { total_users: 0, active_students: 0, lecturers: 0, staff: 0, admins: 0 });
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

  const updateRole = async (userId, role) => {
    try {
      await api.patch(`auth/admin-users/${userId}/role/`, { role });
      setUsers((currentUsers) => currentUsers.map((user) => (
        user.id === userId ? { ...user, role } : user
      )));
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to update this user role.');
    }
  };

  const approveStudent = async (user) => {
    setError('');
    setNotice('');
    try {
      const response = await api.post(`auth/admin-users/${user.id}/approve/`);
      setUsers((currentUsers) => currentUsers.map((currentUser) => (
        currentUser.id === user.id
          ? { ...currentUser, is_activated: true, status: 'active' }
          : currentUser
      )));
      setSummary((current) => ({ ...current, active_students: current.active_students + 1 }));
      setNotice(response.data.detail);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to approve this student.');
    }
  };

  const approveLecturer = async (user) => {
    setError('');
    setNotice('');
    try {
      const response = await api.post(`auth/admin-users/${user.id}/approve-lecturer/`);
      setUsers((currentUsers) => currentUsers.map((currentUser) => (
        currentUser.id === user.id
          ? { ...currentUser, is_active: true, is_activated: true, status: 'active' }
          : currentUser
      )));
      setNotice(response.data.detail);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to approve this lecturer.');
    }
  };

  const filteredUsers = users.filter((user) =>
    [
      user.name,
      user.email,
      user.role,
      user.matric_no,
      user.department,
      user.level,
      user.study_center,
    ].some((value) => value?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const navItems = [
    { icon: 'home', label: 'Home', to: '/' },
    { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
    { icon: 'people', label: 'Users', to: '/admin/users', active: true },
    { icon: 'school', label: 'Courses', to: '/admin/courses' },
    { icon: 'library_books', label: 'Academic Management', to: '/admin/academics' },
    { icon: 'account_balance_wallet', label: 'Payments', to: '/admin/payments' },
    { icon: 'assessment', label: 'Reports', to: '/admin/reports' },
  ];

  return (
    <SidebarLayout
      title="TMBIS Academy"
      subtitle="Admin Portal"
      headerTitle="Users"
      navItems={navItems}
      // showSearch
      // searchPlaceholder="Search users, roles, or email..."
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
        <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-on-surface-variant">
          Verify each application before approving. Approval sends a secure password setup link. Manage lecturers’ assigned courses and levels in the{' '}
          <a href={adminBackendUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">
            backend Django Admin
          </a>
          {' '}under Accounts → Lecturer teaching assignments.
        </div>
        {error && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <MiniStat label="Total Users" value={loading ? '…' : formatNumber(summary.total_users)} />
          <MiniStat label="Active Students" value={loading ? '…' : formatNumber(summary.active_students)} />
          <MiniStat label="Lecturers" value={loading ? '…' : formatNumber(summary.lecturers)} />
          <MiniStat label="Staff" value={loading ? '…' : formatNumber(summary.staff)} />
          <MiniStat label="Admins" value={loading ? '…' : formatNumber(summary.admins)} />
        </div>

        <div className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Name</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Email</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Faculty</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Matric No.</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Lecturer ID</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Department</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Level</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Study Center</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Role</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Semester</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Joined</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-high transition-colors">
                  <td className="px-6 py-5 font-medium text-on-surface">{user.name}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.email}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.faculty || '—'}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.matric_no || '—'}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.lecturer_id || '—'}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.department || '—'}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.level || '—'}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.study_center || '—'}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize">
                      {user.role === 'student' || user.role === 'lecturer' ? (
                        <select
                          value={user.role}
                          onChange={(event) => updateRole(user.id, event.target.value)}
                          className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs capitalize"
                          aria-label={`Change role for ${user.name}`}
                        >
                          <option value="student">Student</option>
                          <option value="lecturer">Lecturer</option>
                        </select>
                      ) : (
                        user.role
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {user.is_activated && !user.has_usable_password ? (
                      <span className="inline-flex rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                        Approved · password setup pending
                      </span>
                    ) : (
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-primary/10 text-primary'
                        : user.status === 'pending approval'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-error/10 text-error'
                    }`}>
                      {user.status}
                    </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant">{user.semester}</td>
                  <td className="px-6 py-5 text-on-surface-variant">{formatDate(user.joined_at)}</td>
                  <td className="px-6 py-5">
                    {user.role === 'student' && !user.is_activated && user.email?.endsWith('@students.tmbis.invalid') && (
                      <span className="text-xs text-on-surface-variant">
                        Waiting for student to register with a working email
                      </span>
                    )}
                    {user.role === 'student' && !user.is_activated && !user.email?.endsWith('@students.tmbis.invalid') && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Approve ${user.name} and email a password setup link to ${user.email}?`)) {
                            approveStudent(user);
                          }
                        }}
                        className="whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary hover:opacity-90"
                      >
                        Approve &amp; send setup link
                      </button>
                    )}
                    {user.role === 'lecturer' && !user.is_active && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Approve ${user.name} and email a password setup link to ${user.email}?`)) {
                            approveLecturer(user);
                          }
                        }}
                        className="whitespace-nowrap rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary hover:opacity-90"
                      >
                        Approve lecturer &amp; send setup link
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
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
