import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SidebarLayout from './SidebarLayout';

const defaultStats = {
  total_revenue: 0,
  active_students: 0,
  completion_rate: 0,
  pending_admissions: 0,
  revenue_trend: [30, 45, 40, 60, 55, 80, 95],
  recent_activity: [],
  notification_recipient_count: 0,
  system_status: [],
  system_status_checked_at: null,
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationSubject, setNotificationSubject] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSending, setNotificationSending] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [notificationSuccess, setNotificationSuccess] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.is_staff && !user.is_superuser) {
      navigate('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('admin-dashboard-stats/');
        setStats({
          ...defaultStats,
          ...res.data,
          revenue_trend: res.data.revenue_trend?.length ? res.data.revenue_trend.map((item) => item.value) : defaultStats.revenue_trend,
        });
        setError('');
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
        setError('Unable to load live stats right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 30000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const sendMassNotification = async (event) => {
    event.preventDefault();
    setNotificationSending(true);
    setNotificationError('');
    setNotificationSuccess('');

    try {
      const response = await api.post('auth/admin-notifications/', {
        subject: notificationSubject,
        message: notificationMessage,
      });
      const count = response.data.recipient_count;
      setNotificationSuccess(
        `Notification sent to ${formatNumber(count)} ${count === 1 ? 'user' : 'users'}.`
      );
      setNotificationSubject('');
      setNotificationMessage('');
    } catch (err) {
      console.error('Failed to send admin mass notification:', err);
      setNotificationError(
        err.response?.data?.detail || 'Unable to send the notification.'
      );
    } finally {
      setNotificationSending(false);
    }
  };

  const emailServiceReady = stats.system_status.some(
    (item) => item.label === 'Email Service' && item.status === 'good'
  );

  const navItems = [
    { icon: 'home', label: 'Home', to: '/' },
    { icon: 'dashboard', label: 'Overview', to: '/admin/dashboard' },
    { icon: 'people', label: 'Users', to: '/admin/users' },
    { icon: 'school', label: 'Courses', to: '/admin/courses' },
    { icon: 'account_balance_wallet', label: 'Finances', to: '/admin/payments' },
    { icon: 'assessment', label: 'Reports', to: '/admin/reports' },
  ];

  const footerItems = [
    { icon: 'settings', label: 'Settings', to: '/admin/settings' },
  ];

  return (
    <SidebarLayout
      title="TMBIS Academy"
      subtitle="Admin Control Center"
      headerTitle="Admin Control Center"
      navItems={navItems}
      footerItems={footerItems}
      showSearch
      searchPlaceholder="Search students, faculty..."
      headerActions={
        <button className="rounded-full p-2 hover:bg-surface-container">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      }
    >
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard title="Total Revenue" value={formatCurrency(stats.total_revenue)} change="Live data" icon="payments" color="primary" loading={loading} />
          <KPICard title="Active Students" value={formatNumber(stats.active_students)} change="Updated live" icon="group" color="primary" loading={loading} />
          <KPICard title="Avg. Completion Rate" value={`${stats.completion_rate}%`} change="" icon="verified" color="primary" loading={loading} />
          <KPICard title="Pending Admissions" value={formatNumber(stats.pending_admissions)} change="Needs review" icon="report_problem" color="error" loading={loading} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Revenue Trend Chart Placeholder */}
          <div className="lg:col-span-2 bg-surface-container p-8 rounded-3xl border border-outline-variant">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline-lg text-primary">Revenue Trends</h3>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-2 text-sm"
              >
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
                <option>Last Year</option>
              </select>
            </div>

            {/* Live Revenue Chart */}
            <div className="h-64 flex items-end gap-3 pt-8">
              {stats.revenue_trend.map((height, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-primary rounded-t transition-all hover:brightness-110"
                    style={{ height: `${Math.max(height / 1.5, 12)}%` }}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant mt-4 font-label-md">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span>
              <span>MAY</span><span>JUN</span><span>JUL</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant flex flex-col">
            <h3 className="font-headline-lg text-primary mb-8">Recent Activity</h3>
            <div className="space-y-8 flex-1 overflow-y-auto">
              {loading && stats.recent_activity.length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Loading recent activity…
                </p>
              ) : stats.recent_activity.length > 0 ? (
                stats.recent_activity.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    icon={activity.icon}
                    title={activity.title}
                    subtitle={activity.subtitle}
                    time={formatRelativeTime(activity.timestamp)}
                  />
                ))
              ) : (
                <p className="text-sm text-on-surface-variant">
                  No recent activity to show.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant">
            <h3 className="font-headline-lg text-primary mb-8">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction icon="manage_accounts" label="Manage Users" onClick={() => navigate('/admin/users')} />
              <QuickAction icon="settings_applications" label="System Settings" onClick={() => navigate('/admin/settings')} />
              <QuickAction icon="analytics" label="Financial Report" onClick={() => navigate('/admin/reports')} />
              <QuickAction
                icon="campaign"
                label="Mass Notification"
                onClick={() => {
                  setNotificationError('');
                  setNotificationSuccess('');
                  setNotificationOpen(true);
                }}
              />
            </div>
          </div>

          <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant">
            <h3 className="font-headline-lg text-primary mb-8">System Status</h3>
            <div className="space-y-6">
              {stats.system_status.map((item) => (
                <StatusItem
                  key={item.label}
                  label={item.label}
                  value={loading ? 'Checking…' : item.value}
                  status={item.status}
                />
              ))}
              {stats.system_status_checked_at && (
                <p className="pt-2 text-xs text-on-surface-variant">
                  Last checked {formatRelativeTime(stats.system_status_checked_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      {notificationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mass-notification-title"
            className="w-full max-w-xl rounded-3xl border border-outline-variant bg-surface-container p-6 shadow-2xl md:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="mass-notification-title" className="font-headline-lg text-primary">
                  Mass Notification
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Sends an email to all {formatNumber(stats.notification_recipient_count)} registered users.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotificationOpen(false)}
                className="rounded-full p-2 hover:bg-surface-container-high"
                aria-label="Close mass notification"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {notificationError && (
              <div className="mb-4 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {notificationError}
              </div>
            )}
            {notificationSuccess && (
              <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                {notificationSuccess}
              </div>
            )}
            {!emailServiceReady && (
              <div className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                Email service is not configured. Notifications cannot be sent right now.
              </div>
            )}

            <form onSubmit={sendMassNotification} className="space-y-5">
              <div>
                <label htmlFor="notification-subject" className="mb-2 block text-sm font-medium">
                  Subject
                </label>
                <input
                  id="notification-subject"
                  type="text"
                  maxLength={200}
                  required
                  value={notificationSubject}
                  onChange={(event) => setNotificationSubject(event.target.value)}
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="notification-message" className="mb-2 block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="notification-message"
                  rows={6}
                  maxLength={10000}
                  required
                  value={notificationMessage}
                  onChange={(event) => setNotificationMessage(event.target.value)}
                  className="w-full resize-y rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNotificationOpen(false)}
                  className="rounded-2xl border border-outline-variant px-5 py-3 font-medium hover:bg-surface-container-high"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={notificationSending || loading || !emailServiceReady || stats.notification_recipient_count === 0}
                  className="rounded-2xl bg-primary px-5 py-3 font-bold text-on-primary transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {notificationSending ? 'Sending…' : 'Send to All Users'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}

function KPICard({ title, value, change, icon, loading }) {
  return (
    <div className="bg-surface-container p-8 rounded-3xl border-l-4 border-primary hover:scale-[1.02] transition-all">
      <div className="flex justify-between items-start mb-6">
        <span className="text-on-surface-variant uppercase tracking-widest text-sm font-medium">{title}</span>
        <span className="material-symbols-outlined text-3xl text-primary">{icon}</span>
      </div>
      <div className="text-4xl font-bold text-primary mb-2">{loading ? '…' : value}</div>
      {change && <p className="text-sm text-primary">{change}</p>}
    </div>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatRelativeTime(timestamp) {
  const activityTime = new Date(timestamp).getTime();
  if (!Number.isFinite(activityTime)) {
    return '';
  }

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - activityTime) / 1000));
  if (elapsedSeconds < 60) {
    return 'Just now';
  }

  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const [unit, unitSeconds] = units.find(([, seconds]) => elapsedSeconds >= seconds);
  const count = Math.floor(elapsedSeconds / unitSeconds);
  return `${count} ${unit}${count === 1 ? '' : 's'} ago`;
}

function ActivityItem({ icon, title, subtitle, time }) {
  return (
    <div className="flex gap-5">
      <div className="bg-surface-container-high w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="font-medium text-on-surface">{title}</p>
        <p className="text-on-surface-variant text-sm mt-1">{subtitle}</p>
        <p className="text-xs text-on-surface-variant mt-3">{time}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center justify-center p-8 bg-surface-container-low border border-outline-variant rounded-3xl hover:border-primary hover:bg-surface-container transition-all group">
      <span className="material-symbols-outlined text-4xl text-primary mb-4 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function StatusItem({ label, value, status }) {
  const color = status === "good"
    ? "text-primary"
    : status === "warning" ? "text-warning" : "text-on-surface-variant";
  return (
    <div className="flex justify-between items-center">
      <span className="text-on-surface-variant">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}