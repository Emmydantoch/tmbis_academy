import { useEffect, useState } from 'react';
import api from '../api/axios';
import SidebarLayout from './SidebarLayout';

const defaultSummary = {
    total_revenue: 0,
    active_students: 0,
    pending_admissions: 0,
    completion_rate: 0,
};

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general');
    const [stats, setStats] = useState(defaultSummary);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLiveStats = async () => {
            try {
                const [dashboardRes, paymentRes] = await Promise.all([
                    api.get('admin-dashboard-stats/'),
                    api.get('payments/admin/'),
                ]);

                setStats({
                    ...defaultSummary,
                    ...dashboardRes.data,
                    total_revenue: paymentRes.data.summary?.total_revenue ?? dashboardRes.data.total_revenue ?? 0,
                });
                setError('');
            } catch (err) {
                console.error('Failed to load live admin settings data:', err);
                setError('Unable to load live system stats right now.');
            } finally {
                setLoading(false);
            }
        };

        fetchLiveStats();
        const intervalId = setInterval(fetchLiveStats, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const navItems = [
        { icon: 'home', label: 'Home', to: '/' },
        { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
        { icon: 'people', label: 'Users', to: '/admin/users' },
        { icon: 'school', label: 'Courses', to: '/admin/courses' },
        { icon: 'settings', label: 'Settings', to: '/admin/settings', active: true },
    ];

    return (
        <SidebarLayout
            title="TMBIS Academy"
            subtitle="Admin Portal"
            headerTitle="Admin Settings"
            navItems={navItems}
            headerActions={
                <button className="rounded-2xl bg-primary px-8 py-3 font-bold text-on-primary transition-all hover:brightness-110">
                    Save All Changes
                </button>
            }
        >
            <div className="flex flex-1 overflow-hidden">
                <nav className="w-72 border-r border-outline-variant p-6 flex flex-col gap-2 overflow-y-auto bg-surface-container-low">
                <p className="px-4 text-xs uppercase tracking-widest text-on-surface-variant mb-4">Configuration</p>

                <TabButton
                    icon="settings_suggest"
                    label="General Settings"
                    active={activeTab === 'general'}
                    onClick={() => setActiveTab('general')}
                />
                <TabButton
                    icon="shield_lock"
                    label="Security & Authentication"
                    active={activeTab === 'security'}
                    onClick={() => setActiveTab('security')}
                />
                <TabButton
                    icon="mail"
                    label="Notifications"
                    active={activeTab === 'notifications'}
                    onClick={() => setActiveTab('notifications')}
                />
                <TabButton
                    icon="hub"
                    label="Integrations"
                    active={activeTab === 'integrations'}
                    onClick={() => setActiveTab('integrations')}
                />
                <TabButton
                    icon="palette"
                    label="Appearance"
                    active={activeTab === 'appearance'}
                    onClick={() => setActiveTab('appearance')}
                />
                </nav>

                <div className="flex-1 overflow-y-auto p-10">
                {error && (
                    <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                        {error}
                    </div>
                )}

                {activeTab === 'general' && <GeneralSettings stats={stats} loading={loading} />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'notifications' && <NotificationsSettings />}
                {activeTab === 'integrations' && <IntegrationsSettings />}
                {activeTab === 'appearance' && <AppearanceSettings />}
                </div>
            </div>
        </SidebarLayout>
    );
}

    function TabButton({ icon, label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl transition-all ${active ? 'bg-primary text-on-primary font-medium' : 'hover:bg-surface-container text-on-surface-variant'}`}
        >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
        </button>
    );
    }

    /* Tab Content Components */
    function GeneralSettings({ stats, loading }) {
    return (
        <div className="max-w-3xl space-y-10">
            <div>
            <h3 className="font-headline-lg text-headline-lg text-primary mb-2">General Settings</h3>
            <p className="text-on-surface-variant">Configure core institution identity and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <MiniStat label="Revenue" value={loading ? '…' : formatCurrency(stats.total_revenue)} />
                <MiniStat label="Students" value={loading ? '…' : formatNumber(stats.active_students)} />
                <MiniStat label="Completion" value={loading ? '…' : `${stats.completion_rate}%`} />
            </div>

            <div className="space-y-8">
            <div>
                <label className="block text-sm text-on-surface-variant mb-3">PLATFORM NAME</label>
                <input type="text" defaultValue="AcademiaPro" className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-6 py-4 focus:border-primary" />
            </div>

            <div>
                <label className="block text-sm text-on-surface-variant mb-3">INSTITUTION LOGO</label>
                <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-surface-container-high rounded-2xl flex items-center justify-center border border-dashed border-outline-variant">
                    <span className="material-symbols-outlined text-5xl text-primary">upload_file</span>
                </div>
                <button className="bg-surface-container-high px-8 py-3 rounded-2xl text-sm font-medium hover:bg-surface-container transition-all">Change Logo</button>
                </div>
            </div>
            </div>
        </div>
    );
    }

    function SecuritySettings() {
    return (
    <div className="max-w-3xl space-y-10">
        <div>
        <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Security & Authentication</h3>
        <p className="text-on-surface-variant">Maintain a secure environment.</p>
        </div>

        <div className="space-y-8">
        <ToggleItem label="Two-Factor Authentication (2FA)" description="Require all admin users to verify identity" defaultChecked />
        <ToggleItem label="Strict Password Policy" description="Must include symbols, numbers, and at least 12 characters" defaultChecked />
        </div>
    </div>
    );
    }

    function NotificationsSettings() {
    return (
    <div className="max-w-3xl">
        <h3 className="font-headline-lg text-headline-lg text-primary mb-8">Notification Settings</h3>
        <div className="space-y-6">
        <NotificationCard title="Student Onboarding" desc="Sent when a new student is admitted" />
        <NotificationCard title="Payment Reminders" desc="Automated chasing for overdue tuition" />
        <NotificationCard title="System Alerts" desc="Maintenance and critical downtime info" />
        </div>
    </div>
    );
    }

    function IntegrationsSettings() {
    return (
    <div className="max-w-3xl">
        <h3 className="font-headline-lg text-headline-lg text-primary mb-8">Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IntegrationCard name="Stripe Payments" status="Connected" />
        <IntegrationCard name="Zoom Video" status="Connected" />
        <IntegrationCard name="Google Drive" status="Disconnected" />
        </div>
    </div>
    );
    }

    function AppearanceSettings() {
    return (
    <div className="max-w-3xl">
        <h3 className="font-headline-lg text-headline-lg text-primary mb-8">Appearance Customization</h3>
        <div className="bg-surface-container p-10 rounded-3xl">
        <label className="block text-sm text-on-surface-variant mb-6">INTERFACE THEME</label>
        <div className="grid grid-cols-3 gap-6">
            <ThemeOption name="Academic Light" active={false} />
            <ThemeOption name="Deep Sea (Dark)" active={true} />
            <ThemeOption name="High Contrast" active={false} />
        </div>
        </div>
    </div>
    );
    }

    /* Reusable Components */
    function MiniStat({ label, value }) {
    return (
        <div className="bg-surface-container p-5 rounded-2xl border border-outline-variant">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">{label}</p>
            <p className="mt-3 text-2xl font-bold text-primary">{value}</p>
        </div>
    );
    }

    function NavItem({ icon, label, active = false }) {
    return (
    <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}`}>
        <span className="material-symbols-outlined">{icon}</span>
        <span>{label}</span>
    </a>
    );
    }

    function ToggleItem({ label, description, defaultChecked }) {
    return (
    <div className="flex items-center justify-between py-6 border-b border-outline-variant/10 last:border-0">
        <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-12 h-6 bg-surface-container-high peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:content-[''] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    </div>
    );
    }

    function NotificationCard({ title, desc }) {
    return (
    <div className="bg-surface-container p-8 rounded-3xl flex justify-between items-center border border-outline-variant">
        <div>
        <p className="font-bold text-on-surface">{title}</p>
        <p className="text-sm text-on-surface-variant">{desc}</p>
        </div>
        <button className="text-primary font-medium hover:underline">Edit Template</button>
    </div>
    );
    }

    function IntegrationCard({ name, status }) {
    const connected = status === "Connected";
    return (
    <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant">
        <div className="flex justify-between items-start">
        <div>
            <p className="font-bold text-on-surface">{name}</p>
            <p className={`text-sm mt-1 ${connected ? "text-primary" : "text-on-surface-variant"}`}>{status}</p>
        </div>
        <button className={`px-6 py-2 rounded-2xl text-sm font-medium ${connected ? "bg-surface-container-high" : "bg-primary text-on-primary"}`}>
            {connected ? "Configure" : "Connect"}
        </button>
        </div>
    </div>
    );
    }

    function ThemeOption({ name, active }) {
    return (
    <div className={`p-4 rounded-2xl border ${active ? "border-primary" : "border-outline-variant"} cursor-pointer hover:border-primary transition-all`}>
        <div className={`h-32 rounded-xl ${active ? "bg-[#07122a]" : "bg-white"} flex items-center justify-center text-4xl`}>
        {active ? "🌊" : "☀️"}
        </div>
        <p className="text-center mt-4 font-medium">{name}</p>
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