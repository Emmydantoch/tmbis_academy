import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import ProfileAvatarMenu from './ProfileAvatarMenu';

export default function SidebarLayout({
    title = 'TMBIS Academy',
    subtitle = 'Learning Portal',
    navItems = [],
    footerItems = [],
    headerTitle = 'Dashboard',
    logo = localStorage.getItem('tmbis-institution-logo') || '',
    children,
    headerActions = null,
    showSearch = false,
    searchPlaceholder = 'Search...',
}) {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profile, setProfile] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    });
    const displayTitle = localStorage.getItem('tmbis-platform-name') || title;

    return (
    <div className="min-h-screen bg-background text-on-surface flex">
        {mobileMenuOpen && (
            <div
                className="fixed inset-0 z-30 bg-black/50 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
            />
        )}

        <nav className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed left-0 top-0 z-40 flex w-64 flex-col h-screen bg-surface-container-low border-r border-outline-variant p-4 transition-transform duration-300`}>
        <div className="mb-8 px-2">
            <div className="flex items-center gap-3">
                {logo && (
                    <img src={logo} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-surface object-contain p-1" />
                )}
                <h1 className="font-headline-lg font-bold text-primary">{displayTitle}</h1>
            </div>
            <p className="text-on-surface-variant text-sm">{subtitle}</p>
        </div>

        <div className="flex-1 space-y-1">
            {navItems.map((item) => {
            const isActive = item.active || (item.to && location.pathname === item.to);
            return (
                <Link
                key={item.label}
                to={item.to || '#'}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
                    isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
                >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                </Link>
            );
            })}
        </div>

        {footerItems.length > 0 && (
            <div className="mt-auto space-y-1 border-t border-outline-variant pt-6">
            {footerItems.map((item) => (
                <Link
                key={item.label}
                to={item.to || '#'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface"
                >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                </Link>
            ))}
            </div>
        )}
        </nav>

        <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-outline-variant bg-surface px-6">
            <div className="flex flex-1 items-center gap-4">
            <button
                type="button"
                aria-label="Open navigation menu"
                className="rounded-full p-2 hover:bg-surface-container md:hidden"
                onClick={() => setMobileMenuOpen(true)}
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">{headerTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
            {showSearch && (
                <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    search
                </span>
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="w-72 rounded-full border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-4 focus:border-primary focus:outline-none"
                />
                </div>
            )}

            {headerActions}

            <NotificationBell />

            <ProfileAvatarMenu profile={profile} onProfileUpdate={setProfile} />
            </div>
        </header>

        <main>{children}</main>
        </div>
    </div>
    );
}
