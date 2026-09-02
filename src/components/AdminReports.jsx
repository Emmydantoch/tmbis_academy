import { useEffect, useState } from 'react';
import api from '../api/axios';
import SidebarLayout from './SidebarLayout';

export default function AdminReports() {
  const [summary, setSummary] = useState({ total_revenue: 0, total_applications: 0, accepted: 0, pending: 0, active_students: 0 });
  const [byProgram, setByProgram] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('admin-reports/');
        setSummary(response.data.summary || { total_revenue: 0, total_applications: 0, accepted: 0, pending: 0, active_students: 0 });
        setByProgram(response.data.by_program || []);
        setError('');
      } catch (err) {
        console.error('Failed to load reports:', err);
        setError('Unable to load live reports right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
    const intervalId = setInterval(fetchReports, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const navItems = [
    { icon: 'home', label: 'Home', to: '/' },
    { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
    { icon: 'people', label: 'Users', to: '/admin/users' },
    { icon: 'school', label: 'Courses', to: '/admin/courses' },
    { icon: 'account_balance_wallet', label: 'Payments', to: '/admin/payments' },
    { icon: 'assessment', label: 'Reports', to: '/admin/reports', active: true },
  ];

  return (
    <SidebarLayout
      title="TMBIS Academy"
      subtitle="Admin Portal"
      headerTitle="Reports"
      navItems={navItems}
      showSearch
      searchPlaceholder="Search reports..."
    >
      <div className="p-6 md:p-10 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
          <MiniStat label="Revenue" value={loading ? '…' : formatCurrency(summary.total_revenue)} />
          <MiniStat label="Applications" value={loading ? '…' : formatNumber(summary.total_applications)} />
          <MiniStat label="Accepted" value={loading ? '…' : formatNumber(summary.accepted)} />
          <MiniStat label="Pending" value={loading ? '…' : formatNumber(summary.pending)} />
          <MiniStat label="Students" value={loading ? '…' : formatNumber(summary.active_students)} />
        </div>

        <div className="bg-surface-container rounded-3xl border border-outline-variant p-8">
          <h3 className="font-headline-lg text-primary mb-8">Applications by Program</h3>
          <div className="space-y-5">
            {byProgram.map((item) => (
              <div key={item.program}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-on-surface-variant">{item.program}</span>
                  <span className="font-medium text-on-surface">{item.count}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface-container-high">
                  <div
                    className="h-2.5 rounded-full bg-primary"
                    style={{ width: `${Math.min((item.count / Math.max(...byProgram.map((row) => row.count), 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
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
      <p className="mt-3 text-2xl font-bold text-primary">{value}</p>
    </div>
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}
