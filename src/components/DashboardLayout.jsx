import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const [userName, setUserName] = useState('Student');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // ── Auth Guard: redirect to login if no valid session exists ──
    const accessToken = localStorage.getItem('access_token');
    const raw = localStorage.getItem('user');

    if (!accessToken || accessToken === 'null' || accessToken === 'undefined' || !raw) {
      navigate('/login');
      return;
    }

    try {
      const u = JSON.parse(raw);
      const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
      if (name) setUserName(name);
      else if (u.email) setUserName(u.email.split('@')[0]);

      if (u.avatar || u.profile_picture || u.avatar_url) {
        setAvatarUrl(u.avatar || u.profile_picture || u.avatar_url);
      }

      const admin =
        u.is_admin === true ||
        u.is_staff === true ||
        u.role === 'admin' ||
        u.role === 'superuser';
      setIsAdmin(admin);

      if (u.role === 'lecturer' || u.role === 'teacher' || u.role === 'instructor') {
        setUserRole('lecturer');
      }
    } catch (e) {
      // Corrupted user data → force re-login
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    // ── Clear all auth keys (matching exactly what Login.jsx saves) ──
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Student navigation items
  const studentNavItems = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', exact: true },
    { to: '/', icon: 'home', label: 'Landing Page' },
    { to: '/dashboard/faculty', icon: 'group', label: 'Faculty' },
    { to: '/dashboard/library', icon: 'library_books', label: 'Library' },
    { to: '/dashboard/live-session', icon: 'videocam', label: 'Live Sessions' },
    { to: '/dashboard/exams/1', icon: 'quiz', label: 'Exams & Tests' },
    { to: '/dashboard/payment', icon: 'account_balance_wallet', label: 'Payments' },
    { to: '/dashboard/resources', icon: 'article', label: 'Resources' },
  ];

  // Lecturer navigation items
  const lecturerNavItems = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', exact: true },
    { to: '/dashboard/my-courses', icon: 'school', label: 'My Courses' },
    { to: '/dashboard/schedule', icon: 'calendar_month', label: 'Schedule' },
    { to: '/dashboard/grades', icon: 'grade', label: 'Grades' },
  ];

  const navItems = userRole === 'lecturer' ? lecturerNavItems : studentNavItems;

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to) && item.to !== '/';
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed left-0 top-0 z-40 md:z-20 flex flex-col h-screen w-64 bg-surface-container-low border-r border-outline-variant p-4 transition-transform duration-300`}
      >
        {/* User Profile Section */}
        <div className="mb-8 mt-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary mb-4 flex items-center justify-center bg-surface-container-low">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-primary">
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">
            Welcome, {userName}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {userRole === 'lecturer' ? 'Lecturer' : 'Computer Science Major'}
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item)
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}

          {/* Admin Settings — only for admins */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span className="font-medium">Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-auto pt-6 border-t border-outline-variant space-y-1">
          <Link
            to="/dashboard/change-password"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === '/dashboard/change-password'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">lock_reset</span>
            <span className="font-medium">Change Password</span>
          </Link>
          <Link
            to="/dashboard/contact"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === '/dashboard/contact'
                ? 'bg-primary text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined">contact_support</span>
            <span className="font-medium">Support</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-on-surface-variant hover:bg-surface-container hover:text-on-surface w-full text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {/* Top Header */}
        <header className="h-16 bg-surface-container-low border-b border-outline-variant sticky top-0 z-10 flex items-center px-6">
          <div className="flex-1 flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-full hover:bg-surface-container"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              TMBIS Academy
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-2 w-72 bg-surface-container-lowest border border-outline-variant rounded-full focus:outline-none focus:border-primary"
              />
            </div>

            <button className="p-2 rounded-full hover:bg-surface-container relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>

            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center bg-surface-container-low">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="object-cover w-full h-full" />
              ) : (
                <span className="text-sm font-semibold">
                  {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Child Page Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
