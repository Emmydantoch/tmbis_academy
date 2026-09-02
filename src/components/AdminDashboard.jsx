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
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
              <ActivityItem
                icon="person_add"
                title="New Instructor Signed Up"
                subtitle="Dr. Elena Rodriguez joined Science faculty"
                time="2 minutes ago"
              />
              <ActivityItem
                icon="cloud_done"
                title="System Backup Completed"
                subtitle="Database cluster synchronization successful"
                time="1 hour ago"
              />
              <ActivityItem
                icon="send"
                title="Bulk Invoices Sent"
                subtitle="Summer semester billing sent to 450 users"
                time="3 hours ago"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant">
            <h3 className="font-headline-lg text-primary mb-8">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction icon="manage_accounts" label="Manage Users" />
              <QuickAction icon="settings_applications" label="System Settings" />
              <QuickAction icon="analytics" label="Financial Report" />
              <QuickAction icon="campaign" label="Mass Notification" />
            </div>
          </div>

          <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant">
            <h3 className="font-headline-lg text-primary mb-8">System Status</h3>
            <div className="space-y-6">
              <StatusItem label="Server Status" value="Healthy" status="good" />
              <StatusItem label="Security Protocol" value="AES-256 Enabled" status="good" />
              <StatusItem label="Next Patch" value="v4.2.1-Stable" status="info" />
            </div>
          </div>
        </div>
      </div>
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

function QuickAction({ icon, label }) {
  return (
    <button className="flex flex-col items-center justify-center p-8 bg-surface-container-low border border-outline-variant rounded-3xl hover:border-primary hover:bg-surface-container transition-all group">
      <span className="material-symbols-outlined text-4xl text-primary mb-4 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function StatusItem({ label, value, status }) {
  const color = status === "good" ? "text-primary" : "text-on-surface-variant";
  return (
    <div className="flex justify-between items-center">
      <span className="text-on-surface-variant">{label}</span>
      <span className={`font-medium ${color}`}>{value}</span>
    </div>
  );
}