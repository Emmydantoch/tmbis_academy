import { useEffect, useState } from 'react';
import api from '../api/axios';
import SidebarLayout from './SidebarLayout';

export default function AdminUsers({
  pendingOldStudentRegistrationsOnly = false,
}) {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total_users: 0, active_students: 0, lecturers: 0, staff: 0, admins: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    matric_no: '',
    department: '',
    level: '',
    study_center: '',
    phone_number: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || user.name || '',
      matric_no: user.matric_no || '',
      department: user.department || '',
      level: user.level || '',
      study_center: user.study_center || '',
      phone_number: user.phone_number || '',
    });
    setEditError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    setEditError('');
    try {
      const response = await api.patch(`auth/admin-users/${editingUser.id}/`, editForm);
      setUsers((currentUsers) =>
        currentUsers.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: response.data.name || response.data.full_name || u.name,
                full_name: response.data.full_name || editForm.full_name,
                matric_no: response.data.matric_no || editForm.matric_no,
                department: response.data.department || editForm.department,
                level: response.data.level || editForm.level,
                study_center: response.data.study_center || editForm.study_center,
                phone_number: response.data.phone_number || editForm.phone_number,
              }
            : u
        )
      );
      setNotice(response.data.detail || `Updated ${editForm.full_name} successfully.`);
      setEditingUser(null);
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update student profile.');
    } finally {
      setSavingEdit(false);
    }
  };

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

  const isPendingOldStudentRegistration = (user) => (
    user.role === 'student'
    && user.registration_type === 'old'
    && !user.is_activated
    && !user.email?.endsWith('@students.tmbis.invalid')
  );
  const pendingOldStudentCount = users.filter(isPendingOldStudentRegistration).length;
  const filteredUsers = users.filter((user) => {
    if (
      pendingOldStudentRegistrationsOnly
      && !isPendingOldStudentRegistration(user)
    ) {
      return false;
    }
    return [
      user.name,
      user.email,
      user.role,
      user.registration_type,
      user.matric_no,
      user.department,
      user.level,
      user.study_center,
    ].some((value) => value?.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const navItems = [
    { icon: 'home', label: 'Home', to: '/' },
    { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
    { icon: 'people', label: 'Users', to: '/admin/users', active: !pendingOldStudentRegistrationsOnly },
    { icon: 'how_to_reg', label: 'Old Student Registrations', to: '/admin/registrations', active: pendingOldStudentRegistrationsOnly },
    { icon: 'school', label: 'Courses', to: '/admin/courses' },
    { icon: 'library_books', label: 'Academic Management', to: '/admin/academics' },
    { icon: 'account_balance_wallet', label: 'Payments', to: '/admin/payments' },
    { icon: 'assessment', label: 'Reports', to: '/admin/reports' },
  ];

  return (
    <SidebarLayout
      title="EKSU Admin Portal"
      subtitle="Admin Portal"
      headerTitle={pendingOldStudentRegistrationsOnly ? 'Old Student Registrations' : 'Users'}
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
        {pendingOldStudentRegistrationsOnly && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-on-surface-variant">
            {pendingOldStudentCount} old student registration(s) are awaiting
            approval. Approving a student sends their secure password setup link.
          </div>
        )}
        <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-on-surface-variant">
          Verify each application before approving. Approval sends a secure password setup link. Manage lecturer course and programme assignments in{' '}
          <a href="/admin/academics" className="font-semibold text-primary underline">
            Academic Management
          </a>
          .
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
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Registration Type</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Semester</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Joined</th>
                <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={14} className="px-6 py-8 text-center text-on-surface-variant">
                    {loading
                      ? 'Loading registrations...'
                      : pendingOldStudentRegistrationsOnly
                        ? 'No pending old-student registrations.'
                        : 'No users match your search.'}
                  </td>
                </tr>
              )}
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
                  <td className="px-6 py-5 text-on-surface-variant">
                    {user.registration_type === 'old'
                      ? 'Old student'
                      : 'New student'}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container"
                        title="Edit student/user details"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span>Edit</span>
                      </button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-3xl bg-surface-container-high border border-outline-variant p-6 shadow-2xl text-on-surface">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant">
              <div>
                <h3 className="text-lg font-bold text-on-surface">Edit User Details</h3>
                <p className="text-xs text-on-surface-variant">Update official name and student academic records</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {editError && (
              <div className="mt-4 rounded-xl border border-error/40 bg-error/10 p-3 text-xs text-error">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Full Name (SURNAME Firstname Othername)
                </label>
                <input
                  name="full_name"
                  value={editForm.full_name}
                  onChange={handleEditChange}
                  required
                  placeholder="e.g. AJAGUNJEUN Fauziyyah Obolanle"
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Matric No
                  </label>
                  <input
                    name="matric_no"
                    value={editForm.matric_no}
                    onChange={handleEditChange}
                    placeholder="e.g. 210901001"
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Level
                  </label>
                  <input
                    name="level"
                    value={editForm.level}
                    onChange={handleEditChange}
                    placeholder="e.g. 200, 300, 400"
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Department
                  </label>
                  <input
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                    placeholder="e.g. Computer Science, Accounting"
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                    Study Center
                  </label>
                  <input
                    name="study_center"
                    value={editForm.study_center}
                    onChange={handleEditChange}
                    placeholder="e.g. Ado-Ekiti"
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                  Phone Number
                </label>
                <input
                  name="phone_number"
                  value={editForm.phone_number}
                  onChange={handleEditChange}
                  placeholder="e.g. 08012345678"
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
