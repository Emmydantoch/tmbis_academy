import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 30 minutes of inactivity threshold
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
// 2 minutes warning countdown before final logout (starts at 28m)
const WARNING_BEFORE_TIMEOUT_MS = 2 * 60 * 1000;
const WARNING_START_MS = INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS;

// Storage keys
const LAST_ACTIVE_KEY = 'tmbis_last_active';
const TIMEOUT_MSG_KEY = 'session_timeout_message';
const REDIRECT_KEY = 'tmbis_post_login_redirect';

export default function SessionTimeoutManager() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  const lastEventThrottleRef = useRef(0);
  const isWarningOpenRef = useRef(false);

  // Check if a user session is currently logged in
  const isAuthenticated = () => {
    try {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      return Boolean(token && token !== 'null' && token !== 'undefined' && user);
    } catch {
      return false;
    }
  };

  // Perform safe logout, saving session draft state and path
  const handleAutoLogout = useCallback(() => {
    setShowWarning(false);
    isWarningOpenRef.current = false;

    // 1. Dispatch custom event so active pages (exams, forms, notes) can save their draft
    try {
      window.dispatchEvent(
        new CustomEvent('tmbis-session-saving', {
          detail: { reason: 'inactivity_timeout' },
        })
      );
    } catch (e) {
      console.warn('Session save event dispatch error:', e);
    }

    // 2. Remember current location to restore after re-login
    const currentPath = location.pathname + location.search;
    const publicPaths = ['/login', '/register', '/registration', '/apply', '/forgot-password', '/reset-password', '/'];
    if (currentPath && !publicPaths.includes(location.pathname)) {
      try {
        sessionStorage.setItem(REDIRECT_KEY, currentPath);
      } catch (e) {
        console.warn('Could not save redirect path:', e);
      }
    }

    // 3. Set notice for the login page
    try {
      sessionStorage.setItem(
        TIMEOUT_MSG_KEY,
        'You were automatically logged out after 30 minutes of inactivity to protect your account. Please log in again to continue.'
      );
    } catch (e) {
      console.warn('Could not save timeout message:', e);
    }

    // 4. Clear auth credentials
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem(LAST_ACTIVE_KEY);

    // 5. Navigate to login
    navigate('/login', { replace: true });
  }, [location, navigate]);

  // Record user activity and update cross-tab storage
  const recordActivity = useCallback(() => {
    if (!isAuthenticated()) return;

    const now = Date.now();
    // Throttle writes to localStorage to at most once every 10 seconds during continuous movement
    if (now - lastEventThrottleRef.current > 10000 || isWarningOpenRef.current) {
      lastEventThrottleRef.current = now;
      try {
        localStorage.setItem(LAST_ACTIVE_KEY, String(now));
      } catch {
        // ignore
      }

      if (isWarningOpenRef.current) {
        setShowWarning(false);
        isWarningOpenRef.current = false;
      }
    }
  }, []);

  // "Stay Logged In" button action
  const handleStayLoggedIn = () => {
    const now = Date.now();
    lastEventThrottleRef.current = now;
    try {
      localStorage.setItem(LAST_ACTIVE_KEY, String(now));
    } catch {
      // ignore
    }
    setShowWarning(false);
    isWarningOpenRef.current = false;
  };

  // Activity listeners across window
  useEffect(() => {
    if (!isAuthenticated()) return undefined;

    // Initialize last active if missing
    if (!localStorage.getItem(LAST_ACTIVE_KEY)) {
      localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now()));
    }

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];

    const onUserActivity = () => {
      recordActivity();
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, onUserActivity, { passive: true });
    });

    // Cross-tab synchronization
    const onStorageChange = (e) => {
      if (e.key === LAST_ACTIVE_KEY && e.newValue) {
        // Activity detected in another tab
        if (isWarningOpenRef.current) {
          setShowWarning(false);
          isWarningOpenRef.current = false;
        }
      } else if (e.key === 'access_token' && !e.newValue) {
        // Logged out in another tab
        setShowWarning(false);
        isWarningOpenRef.current = false;
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', onStorageChange);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onUserActivity);
      });
      window.removeEventListener('storage', onStorageChange);
    };
  }, [recordActivity, navigate, location.pathname]);

  // Interval timer checking for inactivity every second
  useEffect(() => {
    if (!isAuthenticated()) {
      setShowWarning(false);
      isWarningOpenRef.current = false;
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      if (!isAuthenticated()) {
        setShowWarning(false);
        isWarningOpenRef.current = false;
        return;
      }

      const rawLast = localStorage.getItem(LAST_ACTIVE_KEY);
      const lastActive = rawLast ? parseInt(rawLast, 10) : Date.now();
      const idleTime = Date.now() - lastActive;

      // Check if full 30 minutes expired
      if (idleTime >= INACTIVITY_TIMEOUT_MS) {
        handleAutoLogout();
        return;
      }

      // Check if in 28m - 30m warning window
      if (idleTime >= WARNING_START_MS) {
        const remainingMs = Math.max(0, INACTIVITY_TIMEOUT_MS - idleTime);
        const remSecs = Math.ceil(remainingMs / 1000);
        setSecondsRemaining(remSecs);
        setShowWarning(true);
        isWarningOpenRef.current = true;
      } else {
        if (isWarningOpenRef.current) {
          setShowWarning(false);
          isWarningOpenRef.current = false;
        }
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [handleAutoLogout, location.pathname]);

  if (!showWarning) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl bg-surface-container-high border border-outline-variant p-6 shadow-2xl text-on-surface">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <span className="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div>
            <h2 id="inactivity-title" className="text-lg font-bold text-on-surface">
              Session Inactivity Notice
            </h2>
            <p className="text-xs text-on-surface-variant">Automatic logout in progress</p>
          </div>
        </div>

        <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
          You have been inactive for over 28 minutes. Any current work or drafts are being saved. For your account security, your session will automatically close in:
        </p>

        <div className="flex items-center justify-center py-4 my-2 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
          <div className="flex items-baseline gap-1 text-3xl font-extrabold tracking-wider text-amber-500 font-mono">
            <span>{formattedCountdown}</span>
            <span className="text-xs font-normal text-on-surface-variant uppercase tracking-normal">remaining</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleStayLoggedIn}
            className="w-full flex-1 rounded-xl bg-primary py-3 px-4 text-center text-sm font-semibold text-on-primary shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
          >
            Stay Logged In
          </button>
          <button
            type="button"
            onClick={handleAutoLogout}
            className="w-full sm:w-auto rounded-xl border border-outline-variant py-3 px-4 text-center text-sm font-medium text-error hover:bg-surface-container focus:outline-none transition-all"
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
