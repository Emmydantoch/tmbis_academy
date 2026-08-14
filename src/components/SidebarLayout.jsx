import { Link, useLocation } from 'react-router-dom';

export default function SidebarLayout({
    title = 'TMBIS Academy',
    subtitle = 'Learning Portal',
    navItems = [],
    footerItems = [],
    headerTitle = 'Dashboard',
    children,
    headerActions = null,
    showSearch = false,
    searchPlaceholder = 'Search...',
    profileImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXGuHtLxOFZHUj9y7PHjvU_PadOmMMsC_tkvCbxww2gR9O1Os1Y9GqpFw5zalhq4cevRlbBjuLwF69cZfWgBJDFamdsJS5G0Q6hVGsLomewqEA_ygtScFaULRWUFT7YB33Q-Wy-O83qUeHP-zJC-ljioQ6U6dwd3uL7MHzmtFYfQ9wD8azANMadX4WS5CPAFh_R3EfX6fdIr9Z_3FSHvZt5nP1l9lnD8R_6g7Ry_1TiAMeJDCk1In-Wl-8yNgiuZoTpRBT9PtxCQhJ',
    }) {
    const location = useLocation();

    return (
    <div className="min-h-screen bg-background text-on-surface flex">
        <nav className="hidden md:flex w-64 flex-col h-screen bg-surface-container-low border-r border-outline-variant fixed left-0 top-0 z-20 p-4">
        <div className="mb-8 px-2">
            <h1 className="font-headline-lg font-bold text-primary">{title}</h1>
            <p className="text-on-surface-variant text-sm">{subtitle}</p>
        </div>

        <div className="flex-1 space-y-1">
            {navItems.map((item) => {
            const isActive = item.active || (item.to && location.pathname === item.to);
            return (
                <Link
                key={item.label}
                to={item.to || '#'}
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
            <button className="rounded-full p-2 hover:bg-surface-container md:hidden">
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

            <div className="h-8 w-8 overflow-hidden rounded-full border border-outline-variant">
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
            </div>
            </div>
        </header>

        <main>{children}</main>
        </div>
    </div>
    );
}
