import { useEffect, useState } from 'react';
import api from '../api/axios';
import SidebarLayout from './SidebarLayout';

const defaultSummary = {
    total_revenue: 0,
    active_students: 0,
    pending_admissions: 0,
    completion_rate: 0,
};
const defaultPlatformSettings = {
    platform_name: 'TMBIS Academy',
    strict_password_policy: true,
    two_factor_enabled: false,
    integrations: [],
};

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general');
    const [theme, setTheme] = useState(() => localStorage.getItem('tmbis-theme') || 'deep-sea');
    const [stats, setStats] = useState(defaultSummary);
    const [platformSettings, setPlatformSettings] = useState(defaultPlatformSettings);
    const [loading, setLoading] = useState(true);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [settingsError, setSettingsError] = useState('');
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('tmbis-theme', theme);
    }, [theme]);

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

        const fetchPlatformSettings = async () => {
            try {
                const response = await api.get('auth/admin-settings/');
                setPlatformSettings({
                    ...defaultPlatformSettings,
                    ...response.data,
                });
                localStorage.setItem('tmbis-platform-name', response.data.platform_name);
                setSettingsError('');
            } catch (err) {
                console.error('Failed to load admin platform settings:', err);
                setSettingsError('Unable to load saved platform settings right now.');
            } finally {
                setSettingsLoading(false);
            }
        };

        fetchLiveStats();
        fetchPlatformSettings();
        const intervalId = setInterval(fetchLiveStats, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const saveSettings = async () => {
        setSaving(true);
        setSettingsError('');
        setSaveMessage('');
        try {
            const response = await api.patch('auth/admin-settings/', {
                platform_name: platformSettings.platform_name,
                strict_password_policy: platformSettings.strict_password_policy,
            });
            setPlatformSettings((current) => ({ ...current, ...response.data }));
            localStorage.setItem('tmbis-platform-name', response.data.platform_name);
            setSaveMessage('Settings saved successfully.');
        } catch (err) {
            console.error('Failed to save admin platform settings:', err);
            setSettingsError(
                err.response?.data?.platform_name?.[0]
                || err.response?.data?.strict_password_policy?.[0]
                || err.response?.data?.detail
                || 'Unable to save settings right now.'
            );
        } finally {
            setSaving(false);
        }
    };

    const navItems = [
        { icon: 'home', label: 'Home', to: '/' },
        { icon: 'dashboard', label: 'Dashboard', to: '/admin/dashboard' },
        { icon: 'people', label: 'Users', to: '/admin/users' },
        { icon: 'school', label: 'Courses', to: '/admin/courses' },
        { icon: 'settings', label: 'Settings', to: '/admin/settings', active: true },
    ];

    return (
        <SidebarLayout
            title={platformSettings.platform_name}
            subtitle="Admin Portal"
            headerTitle="Admin Settings"
            navItems={navItems}
            headerActions={
                <button
                    type="button"
                    onClick={saveSettings}
                    disabled={saving || settingsLoading}
                    className="rounded-2xl bg-primary px-8 py-3 font-bold text-on-primary transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? 'Saving…' : 'Save Changes'}
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
                {settingsError && (
                    <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
                        {settingsError}
                    </div>
                )}
                {saveMessage && (
                    <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                        {saveMessage}
                    </div>
                )}

                {activeTab === 'general' && (
                    <GeneralSettings
                        stats={stats}
                        loading={loading}
                        platformName={platformSettings.platform_name}
                        onPlatformNameChange={(platform_name) => {
                            setPlatformSettings((current) => ({ ...current, platform_name }));
                            setSaveMessage('');
                        }}
                    />
                )}
                {activeTab === 'security' && (
                    <SecuritySettings
                        strictPasswordPolicy={platformSettings.strict_password_policy}
                        twoFactorEnabled={platformSettings.two_factor_enabled}
                        onStrictPasswordPolicyChange={(strict_password_policy) => {
                            setPlatformSettings((current) => ({
                                ...current,
                                strict_password_policy,
                            }));
                            setSaveMessage('');
                        }}
                    />
                )}
                {activeTab === 'notifications' && <NotificationsSettings />}
                {activeTab === 'integrations' && (
                    <IntegrationsSettings
                        integrations={platformSettings.integrations}
                        loading={settingsLoading}
                    />
                )}
                {activeTab === 'appearance' && <AppearanceSettings theme={theme} onThemeChange={setTheme} />}
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
    function GeneralSettings({ stats, loading, platformName, onPlatformNameChange }) {
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
                <input
                    type="text"
                    maxLength={100}
                    value={platformName}
                    onChange={(event) => onPlatformNameChange(event.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-6 py-4 focus:border-primary"
                />
            </div>

            <div>
                <label className="block text-sm text-on-surface-variant mb-3">INSTITUTION LOGO</label>
                <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-surface-container-high rounded-2xl flex items-center justify-center border border-dashed border-outline-variant">
                    <span className="material-symbols-outlined text-5xl text-primary">upload_file</span>
                </div>
                <span className="text-sm text-on-surface-variant">
                    Logo upload is not available yet.
                </span>
                </div>
            </div>
            </div>
        </div>
    );
    }

    function SecuritySettings({
        strictPasswordPolicy,
        twoFactorEnabled,
        onStrictPasswordPolicyChange,
    }) {
    return (
    <div className="max-w-3xl space-y-10">
        <div>
        <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Security & Authentication</h3>
        <p className="text-on-surface-variant">Maintain a secure environment.</p>
        </div>

        <div className="space-y-8">
        <div className="rounded-2xl border border-outline-variant bg-surface-container p-6">
            <p className="font-medium">Two-Factor Authentication (2FA)</p>
            <p className="mt-2 text-sm text-on-surface-variant">
                {twoFactorEnabled
                    ? 'Enabled for administrator accounts.'
                    : 'Not enabled. An enrollment and verification flow is not configured.'}
            </p>
        </div>
        <ToggleItem
            label="Strict Password Policy"
            description="Require at least 12 characters, one number, and one symbol for new passwords."
            checked={strictPasswordPolicy}
            onChange={onStrictPasswordPolicyChange}
        />
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

    function IntegrationsSettings({ integrations, loading }) {
    return (
    <div className="max-w-3xl">
        <h3 className="font-headline-lg text-headline-lg text-primary mb-8">Integrations</h3>
        <p className="mb-6 text-sm text-on-surface-variant">
    Status reflects configured credentials only; provider connectivity is not actively tested.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
            <p className="text-sm text-on-surface-variant">Checking configured services…</p>
        ) : integrations.map((integration) => (
            <IntegrationCard key={integration.name} {...integration} />
        ))}
        </div>
    </div>
    );
    }

    function AppearanceSettings({ theme, onThemeChange }) {
    return (
    <div className="max-w-3xl">
        <h3 className="font-headline-lg text-headline-lg text-primary mb-8">Appearance Customization</h3>
        <div className="bg-surface-container p-10 rounded-3xl">
        <label className="block text-sm text-on-surface-variant mb-6">INTERFACE THEME</label>
        <p className="mb-6 text-sm text-on-surface-variant">
            Theme changes are saved automatically in this browser.
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <ThemeOption name="Aurora Canvas" theme="aurora" active={theme === 'aurora'} onSelect={onThemeChange} />
            <ThemeOption name="Deep Sea (Dark)" theme="deep-sea" active={theme === 'deep-sea'} onSelect={onThemeChange} />
            <ThemeOption name="High Contrast" theme="high-contrast" active={theme === 'high-contrast'} onSelect={onThemeChange} />
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

    function ToggleItem({ label, description, checked, onChange }) {
    return (
    <div className="flex items-center justify-between py-6 border-b border-outline-variant/10 last:border-0">
        <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
        <input
            type="checkbox"
            aria-label={label}
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            className="sr-only peer"
        />
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

    function IntegrationCard({ name, configured, providers = [], setup_hint }) {
    return (
    <div className="bg-surface-container p-8 rounded-3xl border border-outline-variant">
        <div className="flex justify-between items-start">
        <div>
            <p className="font-bold text-on-surface">{name}</p>
            <p className={`text-sm mt-1 ${configured ? "text-primary" : "text-warning"}`}>
                {configured ? 'Credentials configured' : 'Not configured'}
            </p>
            {providers.length > 0 && (
                <p className="mt-2 text-sm text-on-surface-variant">
                    Providers: {providers.join(', ')}
                </p>
            )}
            <p className="mt-3 text-xs text-on-surface-variant">
                Deployment setup: {setup_hint}
            </p>
        </div>
        </div>
    </div>
    );
    }

    function ThemeOption({ name, theme, active, onSelect }) {
    return (
    <button
        type="button"
        onClick={() => onSelect(theme)}
        aria-pressed={active}
        className={`p-4 rounded-2xl border text-left ${active ? "border-primary" : "border-outline-variant"} cursor-pointer hover:border-primary transition-all`}
    >
        <div className={`theme-preview theme-preview-${theme} h-32 rounded-xl flex items-end justify-between p-4`}>
            <span className="text-2xl font-bold">Aa</span>
            <span className="material-symbols-outlined">{theme === 'aurora' ? 'flare' : theme === 'high-contrast' ? 'contrast' : 'waves'}</span>
        </div>
        <p className="text-center mt-4 font-medium">{name}</p>
    </button>
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