import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Dashboard({ userRole = "student" }) {
  const [userName, setUserName] = useState('Alex');
  const [accessDeniedMsg, setAccessDeniedMsg] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
        if (name) setUserName(name);
        else if (u.email) setUserName(u.email.split('@')[0]);

        // Check if the student needs to set a password
        if (u.has_usable_password === false) {
          setNeedsPassword(true);
        }
      }
    } catch (e) {
      // ignore parse errors
    }

    // Show access-denied banner if redirected from a protected admin route
    if (location.state?.accessDenied) {
      setAccessDeniedMsg(true);
      const t = setTimeout(() => setAccessDeniedMsg(false), 4000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  return (
    <>
      {/* Access Denied Banner */}
      {accessDeniedMsg && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-error text-on-error px-6 py-3 rounded-2xl shadow-2xl animate-bounce-in"
          role="alert"
        >
          <span className="material-symbols-outlined">lock</span>
          <span className="font-medium">Access Denied — Admin privileges required.</span>
        </div>
      )}

      {/* Password Setup Banner */}
      {needsPassword && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-primary text-on-primary px-6 py-3 rounded-2xl shadow-2xl"
          role="alert"
        >
          <span className="material-symbols-outlined">lock_open</span>
          <span className="font-medium">You haven't set a password yet.</span>
          <Link
            to="/dashboard/change-password"
            className="ml-2 underline font-bold hover:opacity-80 transition-opacity"
          >
            Set Password Now
          </Link>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
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

            {/* Course Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </>
  );
}