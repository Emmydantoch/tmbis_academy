import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function formatRelativeTime(timestamp) {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
  );
  if (elapsedSeconds < 60) return 'Just now';
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)} minutes ago`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)} hours ago`;
  return `${Math.floor(elapsedSeconds / 86400)} days ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await api.get('auth/notifications/');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
      setError('');
    } catch (err) {
      console.error('Failed to load dashboard notifications:', err);
      setError('Notifications could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(refreshNotifications, 0);
    const intervalId = window.setInterval(refreshNotifications, 15000);
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') refreshNotifications();
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearTimeout(initialRefresh);
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshNotifications]);

  const handleNotificationClick = async (notification) => {
    setOpen(false);
    try {
      await api.post(`auth/notifications/${notification.id}/read/`);
      await refreshNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError('Could not mark this notification as read.');
    }
    if (notification.link) navigate(notification.link);
  };

  const markAllRead = async () => {
    try {
      await api.post('auth/notifications/');
      await refreshNotifications();
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
      setError('Could not mark notifications as read.');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative rounded-full p-2 hover:bg-surface-container"
        onClick={() => {
          setOpen((wasOpen) => !wasOpen);
          refreshNotifications();
        }}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
            <div>
              <h2 className="font-semibold text-on-surface">Notifications</h2>
              <p className="text-xs text-on-surface-variant">
                {unreadCount ? `${unreadCount} unread` : 'You’re up to date'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline"
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {error && (
            <p role="alert" className="px-4 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-on-surface-variant">
                Loading notifications…
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-on-surface-variant">
                No notifications yet.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex w-full gap-3 border-b border-outline-variant px-4 py-3 text-left last:border-b-0 hover:bg-surface-container ${
                    notification.read ? '' : 'bg-primary/5'
                  }`}
                >
                  <span className="material-symbols-outlined mt-0.5 text-primary">
                    {notification.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-on-surface">
                      {notification.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-on-surface-variant">
                      {notification.message}
                    </span>
                    <span className="mt-1 block text-xs text-on-surface-variant">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                  </span>
                  {!notification.read && (
                    <span
                      aria-label="Unread"
                      className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
