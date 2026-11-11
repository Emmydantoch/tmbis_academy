import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard({ userRole = "student" }) {
  const [storedUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const userName = storedUser
    ? [storedUser.first_name, storedUser.last_name].filter(Boolean).join(' ').trim() ||
      storedUser.email?.split('@')[0] ||
      'Femi'
    : 'Femi';
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');
  const [dismissedAccessDeniedKey, setDismissedAccessDeniedKey] = useState(null);
  const accessDeniedMsg =
    Boolean(location.state?.accessDenied) &&
    dismissedAccessDeniedKey !== location.key;
  const needsPassword = storedUser?.has_usable_password === false;
  const currentRole = ['lecturer', 'teacher', 'instructor'].includes(storedUser?.role)
    ? 'lecturer'
    : userRole;

  useEffect(() => {
    if (currentRole !== 'student') return undefined;

    let active = true;
    api.get('auth/student/courses/')
      .then(({ data }) => {
        if (active) setCourses(data.courses || []);
      })
      .catch((requestError) => {
        console.error('Unable to load student courses:', requestError);
        if (active) setCoursesError('Unable to load your courses right now.');
      })
      .finally(() => {
        if (active) setCoursesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentRole]);

  useEffect(() => {
    if (!location.state?.accessDenied) return;

    const timer = setTimeout(
      () => setDismissedAccessDeniedKey(location.key),
      4000
    );
    return () => clearTimeout(timer);
  }, [location.key, location.state?.accessDenied]);

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
            {currentRole === "student"
              ? "Your courses are matched to your department, level, and current semester. When your programme is set, courses are matched to it too."
              : "You have 3 classes and 47 students today."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Active Courses / Classes */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-sm text-xl text-on-surface">
                {currentRole === "student" ? "Active Courses" : "My Active Classes"}
              </h3>
                {currentRole === "lecturer" && (
                  <Link to="/dashboard/my-courses" className="text-primary hover:underline">
                    View All
                  </Link>
                )}
              </div>

              {currentRole === 'student' ? (
                coursesLoading ? (
                  <p className="text-on-surface-variant">Loading your courses…</p>
                ) : coursesError ? (
                  <p role="alert" className="rounded-xl bg-error/10 px-4 py-3 text-error">
                    {coursesError}
                  </p>
                ) : courses.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-outline-variant p-8 text-center text-on-surface-variant">
                    No courses are assigned for your department, level, and current semester yet.
                    Check that your profile details are correct or contact the administration.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                      <article
                        key={course.id}
                        className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 hover:border-primary transition-all"
                      >
                        <p className="text-sm font-semibold text-primary">
                          {course.course_code}
                        </p>
                        <h4 className="mt-2 text-lg font-semibold text-on-surface">
                          {course.title}
                        </h4>
                        <p className="mt-2 text-sm text-on-surface-variant">
                          {[course.department, `Level ${course.level}`, course.units ? `${course.units} units` : '']
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                        {course.semester_name && (
                          <p className="mt-1 text-sm text-on-surface-variant">
                            {course.semester_name}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Teaching Assignment
                    </span>
                    <h4 className="mt-3 font-semibold text-on-surface">
                      My Teaching Workspace
                    </h4>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      Manage classes, sessions, and grades.
                    </p>
                    <Link to="/dashboard/my-courses" className="mt-4 inline-block text-primary hover:underline">
                      View my courses
                    </Link>
                    <Link to="/dashboard/live-session" className="mt-4 ml-5 inline-block text-primary hover:underline">
                      Schedule a live session
                    </Link>
                  </div>
                </div>
              )}
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
              <Link to="/dashboard/live-session" className="mt-6 w-full bg-primary text-on-primary py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:brightness-110">
                Join Live Session
              </Link>
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