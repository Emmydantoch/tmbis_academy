import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard({ userRole = "student", userName: propUserName }) {
  const [userName, setUserName] = useState(propUserName || 'Alex');
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
        if (name) setUserName(name);
        else if (u.email) setUserName(u.email.split('@')[0]);

        // support custom avatar field if available
        if (u.avatar || u.profile_picture || u.avatar_url) {
          setAvatarUrl(u.avatar || u.profile_picture || u.avatar_url);
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);
  // userRole can be "student" or "lecturer"

  useEffect(() => {
    const header = document.querySelector('header');
    const handleScroll = () => {
      if (!header) return;
      if (window.scrollY > 20) {
        header.classList.add('bg-surface/90', 'backdrop-blur-md', 'shadow-xl');
      } else {
        header.classList.remove('bg-surface/90', 'backdrop-blur-md', 'shadow-xl');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar - Works for both Student & Lecturer */}
      <nav className="hidden md:flex flex-col h-screen w-64 bg-surface-container-low border-r border-outline-variant fixed left-0 top-0 z-20 p-4">
        <div className="mb-8 mt-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary mb-4 flex items-center justify-center bg-surface-container-low">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-primary">{userName.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
            )}
          </div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Welcome, {userName}</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            {userRole === "lecturer" ? "Lecturer" : "Computer Science Major"}
          </p>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <NavItem icon="dashboard" label="Dashboard" active />
          
          {userRole === "student" ? (
            <>
              <NavItem to="/" icon="🎪" label="LandingPage" />
              <NavItem to="/faculty" icon="group" label="Faculty" />
              <NavItem to="/library" icon="upload" label="Library" />
              <NavItem to="/live-session" icon="school" label="Live Sessions" />
              <NavItem to="/exam" icon="quiz" label="Exams & Tests" />
            </>
          ) : (
            <>
              <NavItem to="/my-courses" icon="school" label="My Courses" />
              <NavItem to="/schedule" icon="calendar_month" label="Schedule" />
              <NavItem to="/grades" icon="grade" label="Grades" />
            </>
          )}

          <NavItem icon="settings" label="Settings" />
        </div>

        <div className="mt-auto pt-6 border-t border-outline-variant space-y-1">
          <NavItem icon="contact_support" label="Support" />
          <NavItem icon="logout" label="Logout" />
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {/* Top Navbar */}
        <header className="h-16 bg-surface-container-low border-b border-outline-variant sticky top-0 z-10 flex items-center px-6">
          <div className="flex-1 flex items-center gap-4">
            <button className="md:hidden p-2 rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              TMBIS Academy
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
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
                <span className="text-sm font-semibold">{userName.split(' ').map(n => n[0]).join('').slice(0,2)}</span>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 md:p-10 max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-on-surface">
              Welcome back, {userName}!
            </h2>
            <p className="text-on-surface-variant mt-1">
              {userRole === "student" 
                ? "You have 2 upcoming assignments and 1 live session today." 
                : "You have 3 classes and 47 students today."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content - Active Courses / Classes */}
            <div className="lg:col-span-8 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-sm text-xl text-on-surface">
                  {userRole === "student" ? "Active Courses" : "My Active Classes"}
                </h3>
                <a href="#" className="text-primary hover:underline">View All</a>
              </div>

              {/* Course Cards - You can make this dynamic later */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add your course cards here similar to the UIUX code */}
                {/* Example Course Card */}
                <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant hover:border-primary transition-all">
                  <div className="h-40 bg-cover bg-center" 
                      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/...')" }}>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">Design</span>
                    <h4 className="mt-3 font-semibold text-on-surface">Introduction to UX Design</h4>
                    <p className="text-sm text-on-surface-variant mt-1">Module 3 • 45% Complete</p>
                    <div className="mt-4 h-2 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Widgets */}
            <div className="lg:col-span-4 space-y-6">
              {/* Next Live Session */}
              <div className="bg-surface-container-high border border-primary/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">videocam</span>
                  <span className="uppercase tracking-widest text-primary text-sm font-medium">Up Next</span>
                </div>
                <h3 className="text-xl font-semibold">Data Structures Seminar</h3>
                <p className="text-sm text-on-surface-variant mt-2">Starts in 15 minutes</p>
                <button className="mt-6 w-full bg-primary text-on-primary py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:brightness-110">
                  Join Live Session
                </button>
              </div>

              {/* Recent Activity / Grades */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant">
                <h3 className="font-semibold mb-5">Recent Activity</h3>
                {/* Add recent items here */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Reusable Nav Item Component
function NavItem({ to, icon, label, active = false }) {
  const className = `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
    active
      ? 'bg-primary text-on-primary'
      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
  }`;

  if (to) {
    return (
      <Link to={to} className={className}>
        <span className="material-symbols-outlined">{icon}</span>
        <span className="font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <a href="#" className={className}>
      <span className="material-symbols-outlined">{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  );
}