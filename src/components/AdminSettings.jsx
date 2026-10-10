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
    logo: '',
    integrations: [],
};

function oauthResultError(result) {
    const messages = {
        denied: 'The integration authorization was declined.',
        invalid_state: 'The integration authorization expired or could not be verified. Please try again.',
        admin_required: 'An active administrator must complete the connection.',
        connection_failed: 'The provider could not complete the connection. Check its OAuth app settings and try again.',
    };
    return messages[result] || '';
}

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState(() => (
        new URLSearchParams(window.location.search).has('integration')
            ? 'integrations'
            : 'general'
    ));
    const [theme, setTheme] = useState(() => localStorage.getItem('tmbis-theme') || 'deep-sea');
    const [stats, setStats] = useState(defaultSummary);
    const [platformSettings, setPlatformSettings] = useState(defaultPlatformSettings);
    const [loading, setLoading] = useState(true);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [settingsError, setSettingsError] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoError, setLogoError] = useState('');
    const [logoMessage, setLogoMessage] = useState('');
    const [oauthResult] = useState(
        () => new URLSearchParams(window.location.search).get('result')
    );
    const [integrationError, setIntegrationError] = useState(
        () => oauthResultError(oauthResult)
    );
    const [integrationSuccess] = useState(
        () => oauthResult === 'connected' ? 'Integration connected successfully.' : ''
    );
    const [integrationAction, setIntegrationAction] = useState('');
    const [notificationTemplates, setNotificationTemplates] = useState([]);
    const [notificationLoading, setNotificationLoading] = useState(true);
    const [notificationError, setNotificationError] = useState('');
    const [notificationSuccess, setNotificationSuccess] = useState('');
    const [editingNotificationTemplate, setEditingNotificationTemplate] = useState(null);
    const [notificationSaving, setNotificationSaving] = useState(false);
    const [driveDocuments, setDriveDocuments] = useState([]);
    const [driveHasLoaded, setDriveHasLoaded] = useState(false);
    const [driveFile, setDriveFile] = useState(null);
    const [driveLoading, setDriveLoading] = useState(false);
    const [driveUploading, setDriveUploading] = useState(false);
    const [zoomTopic, setZoomTopic] = useState('');
    const [zoomStartTime, setZoomStartTime] = useState('');
    const [zoomDuration, setZoomDuration] = useState('60');
    const [zoomMeeting, setZoomMeeting] = useState(null);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('tmbis-theme', theme);
    }, [theme]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('result')) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

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
                localStorage.setItem('tmbis-institution-logo', response.data.logo || '');
                setSettingsError('');
            } catch (err) {
                console.error('Failed to load admin platform settings:', err);
                setSettingsError('Unable to load saved platform settings right now.');
            } finally {
                setSettingsLoading(false);
            }
        };

        const fetchNotificationTemplates = async () => {
            try {
                const response = await api.get('auth/admin-notification-templates/');
                setNotificationTemplates(response.data);
                setNotificationError('');
            } catch (err) {
                console.error('Failed to load notification templates:', err);
                setNotificationError(
                    err.response?.data?.detail || 'Unable to load notification templates.'
                );
            } finally {
                setNotificationLoading(false);
            }
        };

        fetchLiveStats();
        fetchPlatformSettings();
        fetchNotificationTemplates();
        const intervalId = setInterval(fetchLiveStats, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const saveNotificationTemplate = async (event) => {
        event.preventDefault();
        setNotificationSaving(true);
        setNotificationError('');
        setNotificationSuccess('');
        try {
            const response = await api.patch(
                `auth/admin-notification-templates/${editingNotificationTemplate.key}/`,
                {
                    subject: editingNotificationTemplate.subject,
                    body: editingNotificationTemplate.body,
                    enabled: editingNotificationTemplate.enabled,
                }
            );
            setNotificationTemplates((current) => current.map((template) => (
                template.key === response.data.key ? response.data : template
            )));
            setEditingNotificationTemplate(null);
            setNotificationSuccess('Notification template saved.');
        } catch (err) {
            console.error('Failed to save notification template:', err);
            setNotificationError(
                err.response?.data?.detail || 'Unable to save this notification template.'
            );
        } finally {
            setNotificationSaving(false);
        }
    };

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
            localStorage.setItem('tmbis-institution-logo', response.data.logo || '');
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

    const uploadInstitutionLogo = async (event) => {
        event.preventDefault();
        if (!logoFile) {
            setLogoError('Choose an image file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('logo', logoFile);
        setLogoUploading(true);
        setLogoError('');
        setLogoMessage('');
        try {
            const response = await api.patch('auth/admin-settings/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setPlatformSettings((current) => ({ ...current, ...response.data }));
            localStorage.setItem('tmbis-institution-logo', response.data.logo || '');
            setLogoFile(null);
            setLogoMessage('Institution logo uploaded successfully.');
        } catch (err) {
            console.error('Failed to upload institution logo:', err);
            setLogoError(
                err.response?.data?.logo?.[0]
                || err.response?.data?.detail
                || 'Unable to upload the institution logo.'
            );
        } finally {
            setLogoUploading(false);
        }
    };

    const connectIntegration = async (provider) => {
        setIntegrationAction(provider);
        setIntegrationError('');
        try {
            const response = await api.post(`auth/admin-integrations/${provider}/connect/`);
            window.location.assign(response.data.authorization_url);
        } catch (err) {
            console.error(`Failed to start ${provider} OAuth:`, err);
            setIntegrationError(
                err.response?.data?.detail || 'Unable to start the integration connection.'
            );
            setIntegrationAction('');
        }
    };

    const disconnectIntegration = async (provider) => {
        setIntegrationAction(provider);
        setIntegrationError('');
        try {
            await api.post(`auth/admin-integrations/${provider}/disconnect/`);
            setPlatformSettings((current) => ({
                ...current,
                integrations: current.integrations.map((integration) => (
                    integration.provider === provider
                        ? { ...integration, connected: false, account_email: '' }
                        : integration
                )),
            }));
            if (provider === 'google_drive') {
                setDriveDocuments([]);
                setDriveHasLoaded(false);
            } else {
                setZoomMeeting(null);
            }
        } catch (err) {
            console.error(`Failed to disconnect ${provider}:`, err);
            setIntegrationError(
                err.response?.data?.detail || 'Unable to disconnect the integration.'
            );
        } finally {
            setIntegrationAction('');
        }
    };

    const fetchDriveDocuments = async () => {
        setDriveLoading(true);
        setIntegrationError('');
        try {
            const response = await api.get(
                'auth/admin-integrations/google_drive/documents/'
            );
            setDriveDocuments(response.data);
            setDriveHasLoaded(true);
        } catch (err) {
            console.error('Failed to load Google Drive documents:', err);
            setIntegrationError(
                err.response?.data?.detail || 'Unable to load Google Drive documents.'
            );
        } finally {
            setDriveLoading(false);
        }
    };

    const uploadDriveDocument = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!driveFile) {
            setIntegrationError('Choose a document to upload.');
            return;
        }
        setDriveUploading(true);
        setIntegrationError('');
        try {
            const formData = new FormData();
            formData.append('file', driveFile);
            await api.post(
                'auth/admin-integrations/google_drive/documents/',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
            setDriveFile(null);
            form.reset();
            await fetchDriveDocuments();
        } catch (err) {
            console.error('Failed to upload Google Drive document:', err);
            setIntegrationError(
                err.response?.data?.detail || 'Unable to upload this document.'
            );
        } finally {
            setDriveUploading(false);
        }
    };

    const downloadDriveDocument = async (document) => {
        setIntegrationAction(`download-${document.id}`);
        setIntegrationError('');
        try {
            const response = await api.get(
                `auth/admin-integrations/google_drive/documents/${encodeURIComponent(document.id)}/download/`,
                { responseType: 'blob' }
            );
            const downloadUrl = URL.createObjectURL(response.data);
            const anchor = window.document.createElement('a');
            anchor.href = downloadUrl;
            anchor.download = document.name;
            anchor.click();
            URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error('Failed to download Google Drive document:', err);
            setIntegrationError('Unable to download this document.');
        } finally {
            setIntegrationAction('');
        }
    };

    const createZoomMeeting = async (event) => {
        event.preventDefault();
        setIntegrationAction('zoom-meeting');
        setIntegrationError('');
        setZoomMeeting(null);
        try {
            const response = await api.post(
                'auth/admin-integrations/zoom/meetings/',
                {
                    topic: zoomTopic,
                    start_time: new Date(zoomStartTime).toISOString(),
                    duration_minutes: zoomDuration,
                }
            );
            setZoomMeeting(response.data);
        } catch (err) {
            console.error('Failed to create Zoom meeting:', err);
            setIntegrationError(
                err.response?.data?.detail || 'Unable to create the Zoom meeting.'
            );
        } finally {
            setIntegrationAction('');
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
            logo={platformSettings.logo}
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
                        logo={platformSettings.logo}
                        logoFile={logoFile}
                        logoError={logoError}
                        logoMessage={logoMessage}
                        logoUploading={logoUploading}
                        onLogoFileChange={(file) => {
                            setLogoFile(file);
                            setLogoError('');
                            setLogoMessage('');
                        }}
                        onLogoUpload={uploadInstitutionLogo}
                        onPlatformNameChange={(platform_name) => {
                            setPlatformSettings((current) => ({ ...current, platform_name }));
                            setSaveMessage('');
                        }}
                    />
                )}
                {activeTab === 'security' && (
                    <SecuritySettings
                        strictPasswordPolicy={platformSettings.strict_password_policy}
                        onStrictPasswordPolicyChange={(strict_password_policy) => {
                            setPlatformSettings((current) => ({
                                ...current,
                                strict_password_policy,
                            }));
                            setSaveMessage('');
                        }}
                    />
                )}
                {activeTab === 'notifications' && (
                    <NotificationsSettings
                        templates={notificationTemplates}
                        loading={notificationLoading}
                        error={notificationError}
                        success={notificationSuccess}
                        editingTemplate={editingNotificationTemplate}
                        saving={notificationSaving}
                        onEdit={(template) => {
                            setNotificationError('');
                            setNotificationSuccess('');
                            setEditingNotificationTemplate({ ...template });
                        }}
                        onTemplateChange={setEditingNotificationTemplate}
                        onSave={saveNotificationTemplate}
                        onCancelEdit={() => setEditingNotificationTemplate(null)}
                    />
                )}
                {activeTab === 'integrations' && (
                    <IntegrationsSettings
                        integrations={platformSettings.integrations}
                        loading={settingsLoading}
                        error={integrationError}
                        success={integrationSuccess}
                        busy={integrationAction}
                        onConnect={connectIntegration}
                        onDisconnect={disconnectIntegration}
                        documents={driveDocuments}
                        driveHasLoaded={driveHasLoaded}
                        driveFile={driveFile}
                        onDriveFileChange={setDriveFile}
                        driveLoading={driveLoading}
                        driveUploading={driveUploading}
                        onLoadDocuments={fetchDriveDocuments}
                        onUploadDocument={uploadDriveDocument}
                        onDownloadDocument={downloadDriveDocument}
                        zoomTopic={zoomTopic}
                        onZoomTopicChange={setZoomTopic}
                        zoomStartTime={zoomStartTime}
                        onZoomStartTimeChange={setZoomStartTime}
                        zoomDuration={zoomDuration}
                        onZoomDurationChange={setZoomDuration}
                        zoomMeeting={zoomMeeting}
                        onCreateMeeting={createZoomMeeting}
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
    function GeneralSettings({
        stats,
        loading,
        platformName,
        logo,
        logoFile,
        logoError,
        logoMessage,
        logoUploading,
        onLogoFileChange,
        onLogoUpload,
        onPlatformNameChange,
    }) {
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
                <div className="flex flex-wrap items-start gap-6">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-high">
                    {logo ? (
                        <img src={logo} alt={`${platformName} logo`} className="h-full w-full object-contain p-2" />
                    ) : (
                        <span className="material-symbols-outlined text-5xl text-primary">image</span>
                    )}
                </div>
                <form onSubmit={onLogoUpload} className="min-w-0 flex-1 space-y-3">
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        aria-label="Choose institution logo"
                        onChange={(event) => onLogoFileChange(event.target.files?.[0] || null)}
                        className="block w-full text-sm text-on-surface-variant file:mr-3 file:rounded-xl file:border-0 file:bg-surface-container-high file:px-4 file:py-2 file:font-medium file:text-on-surface"
                    />
                    <p className="text-xs text-on-surface-variant">
                        PNG, JPEG, WebP, or GIF; maximum 5 MB. Uploaded to Cloudinary.
                    </p>
                    {logoError && <p role="alert" className="text-sm text-error">{logoError}</p>}
                    {logoMessage && <p role="status" className="text-sm text-primary">{logoMessage}</p>}
                    <button
                        type="submit"
                        disabled={!logoFile || logoUploading}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
                    >
                        {logoUploading ? 'Uploading…' : 'Upload logo'}
                    </button>
                </form>
                </div>
            </div>
            </div>
        </div>
    );
    }

    function SecuritySettings({
        strictPasswordPolicy,
        onStrictPasswordPolicyChange,
    }) {
    return (
    <div className="max-w-3xl space-y-10">
        <div>
        <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Security & Authentication</h3>
        <p className="text-on-surface-variant">Maintain a secure environment.</p>
        </div>

        <div className="space-y-8">
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

    function NotificationsSettings({
        templates,
        loading,
        error,
        success,
        editingTemplate,
        saving,
        onEdit,
        onTemplateChange,
        onSave,
        onCancelEdit,
    }) {
    const details = {
        student_onboarding: {
            title: 'Student Onboarding',
            description: 'Sent when an admission application is accepted.',
            placeholders: '$first_name, $full_name, $email, $platform_name',
        },
        payment_reminder: {
            title: 'Payment Reminders',
            description: 'Sent after a payment has been pending for 24 hours, then every 30 days.',
            placeholders: '$first_name, $payment_type, $payment_amount, $payment_date, $platform_name',
        },
        system_alert: {
            title: 'System Alerts',
            description: 'Sent to staff when a monitored health check becomes unhealthy.',
            placeholders: '$service, $description, $checked_at, $platform_name',
        },
    };
    return (
    <div className="max-w-3xl">
        <h3 className="font-headline-lg text-headline-lg text-primary mb-8">Notification Settings</h3>
        <p className="mb-6 text-sm text-on-surface-variant">
            Edit the email subject and message used by automatic notifications. Use the listed placeholders to personalize each email.
        </p>
        {error && (
            <div className="mb-6 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
            </div>
        )}
        {success && (
            <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                {success}
            </div>
        )}
        <div className="space-y-6">
        {loading ? (
            <p className="text-sm text-on-surface-variant">Loading notification templates…</p>
        ) : templates.map((template) => (
            <NotificationCard
                key={template.key}
                title={details[template.key]?.title || template.key}
                desc={details[template.key]?.description || ''}
                enabled={template.enabled}
                onEdit={() => onEdit(template)}
            />
        ))}
        </div>
        {editingTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <form
                    onSubmit={onSave}
                    className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-3xl bg-surface-container p-6 shadow-2xl"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h4 className="text-xl font-bold text-on-surface">
                                Edit {details[editingTemplate.key]?.title || 'notification'} template
                            </h4>
                            <p className="mt-2 text-sm text-on-surface-variant">
                                Available placeholders: {details[editingTemplate.key]?.placeholders}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            aria-label="Close template editor"
                            className="rounded-lg px-3 py-1 text-on-surface-variant hover:bg-surface-container-high"
                        >
                            ✕
                        </button>
                    </div>
                    <label className="block space-y-2 text-sm font-medium">
                        <span>Email subject</span>
                        <input
                            type="text"
                            required
                            maxLength={200}
                            value={editingTemplate.subject}
                            onChange={(event) => onTemplateChange({
                                ...editingTemplate,
                                subject: event.target.value,
                            })}
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
                        />
                    </label>
                    <label className="block space-y-2 text-sm font-medium">
                        <span>Email message</span>
                        <textarea
                            required
                            rows={9}
                            value={editingTemplate.body}
                            onChange={(event) => onTemplateChange({
                                ...editingTemplate,
                                body: event.target.value,
                            })}
                            className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3"
                        />
                    </label>
                    <label className="flex items-center gap-3 text-sm">
                        <input
                            type="checkbox"
                            checked={editingTemplate.enabled}
                            onChange={(event) => onTemplateChange({
                                ...editingTemplate,
                                enabled: event.target.checked,
                            })}
                            className="h-4 w-4 accent-primary"
                        />
                        Send this email automatically
                    </label>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
                        >
                            {saving ? 'Saving…' : 'Save Template'}
                        </button>
                    </div>
                </form>
            </div>
        )}
    </div>
    );
    }

    function IntegrationsSettings({
        integrations,
        loading,
        error,
        success,
        busy,
        onConnect,
        onDisconnect,
        documents,
        driveHasLoaded,
        driveFile,
        onDriveFileChange,
        driveLoading,
        driveUploading,
        onLoadDocuments,
        onUploadDocument,
        onDownloadDocument,
        zoomTopic,
        onZoomTopicChange,
        zoomStartTime,
        onZoomStartTimeChange,
        zoomDuration,
        onZoomDurationChange,
        zoomMeeting,
        onCreateMeeting,
    }) {
    return (
    <div className="max-w-3xl">
        <h3 className="font-headline-lg text-headline-lg text-primary mb-8">Integrations</h3>
        <p className="mb-6 text-sm text-on-surface-variant">
            Connect Google Drive to manage academy documents and Zoom to create meeting links.
        </p>
        {error && (
            <div className="mb-6 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {error}
            </div>
        )}
        {success && (
            <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
                {success}
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
            <p className="text-sm text-on-surface-variant">Checking integration status…</p>
        ) : integrations.map((integration) => (
            <IntegrationCard
                key={integration.provider}
                {...integration}
                busy={busy === integration.provider}
                onConnect={() => onConnect(integration.provider)}
                onDisconnect={() => onDisconnect(integration.provider)}
                documents={documents}
                driveHasLoaded={driveHasLoaded}
                driveFile={driveFile}
                onDriveFileChange={onDriveFileChange}
                driveLoading={driveLoading}
                driveUploading={driveUploading}
                onLoadDocuments={onLoadDocuments}
                onUploadDocument={onUploadDocument}
                onDownloadDocument={onDownloadDocument}
                zoomTopic={zoomTopic}
                onZoomTopicChange={onZoomTopicChange}
                zoomStartTime={zoomStartTime}
                onZoomStartTimeChange={onZoomStartTimeChange}
                zoomDuration={zoomDuration}
                onZoomDurationChange={onZoomDurationChange}
                zoomMeeting={zoomMeeting}
                onCreateMeeting={onCreateMeeting}
            />
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

    function NotificationCard({ title, desc, enabled, onEdit }) {
    return (
    <div className="bg-surface-container p-8 rounded-3xl flex justify-between items-center border border-outline-variant">
        <div>
        <p className="font-bold text-on-surface">{title}</p>
        <p className="text-sm text-on-surface-variant">{desc}</p>
        <p className={`mt-2 text-xs font-medium ${enabled ? 'text-primary' : 'text-warning'}`}>
            {enabled ? 'Automatic email enabled' : 'Automatic email disabled'}
        </p>
        </div>
        <button
            type="button"
            onClick={onEdit}
            className="shrink-0 text-primary font-medium hover:underline"
        >
            Edit Template
        </button>
    </div>
    );
    }

    function IntegrationCard({
        provider,
        name,
        configured,
        connected,
        account_email,
        callback_url,
        setup_hint,
        busy,
        onConnect,
        onDisconnect,
        documents,
        driveHasLoaded,
        driveFile,
        onDriveFileChange,
        driveLoading,
        driveUploading,
        onLoadDocuments,
        onUploadDocument,
        onDownloadDocument,
        zoomTopic,
        onZoomTopicChange,
        zoomStartTime,
        onZoomStartTimeChange,
        zoomDuration,
        onZoomDurationChange,
        zoomMeeting,
        onCreateMeeting,
    }) {
    return (
    <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant">
        <div className="flex justify-between items-start gap-4">
        <div>
            <p className="font-bold text-on-surface">{name}</p>
            <p className={`text-sm mt-1 ${connected ? 'text-primary' : 'text-warning'}`}>
                {connected ? 'Connected' : configured ? 'Ready to connect' : 'Not configured'}
            </p>
            {account_email && (
                <p className="mt-2 text-sm text-on-surface-variant">{account_email}</p>
            )}
            {!connected && (
                <p className="mt-3 break-all text-xs text-on-surface-variant">
                    {configured ? `Register callback URL: ${callback_url}` : setup_hint}
                </p>
            )}
        </div>
        {connected ? (
            <button
                type="button"
                onClick={onDisconnect}
                disabled={busy}
                className="shrink-0 rounded-xl border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-container-high disabled:opacity-50"
            >
                {busy ? 'Working…' : 'Disconnect'}
            </button>
        ) : (
            <button
                type="button"
                onClick={onConnect}
                disabled={!configured || busy}
                className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {busy ? 'Connecting…' : 'Connect'}
            </button>
        )}
        </div>
        {provider === 'google_drive' && connected && (
            <div className="mt-6 border-t border-outline-variant pt-5">
                <div className="flex items-center justify-between gap-3">
                    <h4 className="font-medium">Academy documents</h4>
                    <button
                        type="button"
                        onClick={onLoadDocuments}
                        disabled={driveLoading}
                        className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                    >
                        {driveLoading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
                <form onSubmit={onUploadDocument} className="mt-4 flex flex-col gap-3">
                    <input
                        type="file"
                        required
                        onChange={(event) => onDriveFileChange(event.target.files?.[0] || null)}
                        className="w-full text-sm text-on-surface-variant file:mr-3 file:rounded-xl file:border-0 file:bg-surface-container-high file:px-4 file:py-2 file:font-medium file:text-on-surface"
                    />
                    {driveFile && (
                        <button
                            type="submit"
                            disabled={driveUploading}
                            className="self-start rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
                        >
                            {driveUploading ? 'Uploading…' : 'Upload document'}
                        </button>
                    )}
                </form>
                {documents.length === 0 ? (
                    <p className="mt-4 text-sm text-on-surface-variant">
                        {driveLoading
                            ? 'Loading documents…'
                            : driveHasLoaded
                                ? 'No documents found in this Google Drive account.'
                                : 'Select Refresh to load Google Drive documents.'}
                    </p>
                ) : (
                    <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
                        {documents.map((document) => (
                            <li key={document.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3">
                                <span className="truncate text-sm">{document.name}</span>
                                <button
                                    type="button"
                                    onClick={() => onDownloadDocument(document)}
                                    disabled={busy === `download-${document.id}`}
                                    className="shrink-0 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                                >
                                    {busy === `download-${document.id}` ? 'Downloading…' : 'Download'}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )}
        {provider === 'zoom' && connected && (
            <div className="mt-6 border-t border-outline-variant pt-5">
                <h4 className="font-medium">Create a Zoom meeting</h4>
                <form onSubmit={onCreateMeeting} className="mt-4 space-y-3">
                    <input
                        type="text"
                        required
                        maxLength={200}
                        value={zoomTopic}
                        onChange={(event) => onZoomTopicChange(event.target.value)}
                        placeholder="Meeting title"
                        className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm"
                    />
                    <label className="block text-xs text-on-surface-variant">
                        Start time
                        <input
                            type="datetime-local"
                            required
                            value={zoomStartTime}
                            onChange={(event) => onZoomStartTimeChange(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface"
                        />
                    </label>
                    <label className="block text-xs text-on-surface-variant">
                        Duration (minutes)
                        <input
                            type="number"
                            required
                            min="1"
                            max="1440"
                            value={zoomDuration}
                            onChange={(event) => onZoomDurationChange(event.target.value)}
                            className="mt-1 w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={busy === 'zoom-meeting'}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary disabled:opacity-50"
                    >
                        {busy === 'zoom-meeting' ? 'Creating…' : 'Create meeting'}
                    </button>
                </form>
                {zoomMeeting && (
                    <div className="mt-4 rounded-xl bg-surface-container-low p-4 text-sm">
                        <p className="font-medium">{zoomMeeting.topic}</p>
                        <a
                            href={zoomMeeting.join_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block break-all text-primary hover:underline"
                        >
                            {zoomMeeting.join_url}
                        </a>
                    </div>
                )}
            </div>
        )}
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