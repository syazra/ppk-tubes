import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import Icon, { initials } from './Icons';

const userNavigation = [
    { key: 'dashboard', icon: 'home', label: 'Dasbor' },
    { key: 'reservations', icon: 'calendar', label: 'Reservasi' },
    { key: 'reports', icon: 'tool', label: 'Laporan' },
];

const adminNavigation = [
    { key: 'dashboard', icon: 'home', label: 'Dasbor' },
    { key: 'registrations', icon: 'student', label: 'Registrasi' },
    { key: 'facilities', icon: 'room', label: 'Fasilitas' },
    { key: 'recap', icon: 'chart', label: 'Rekap Fasilitas' },
    { key: 'profile', icon: 'user', label: 'Profil' },
];

const operatorNavigation = [
    { key: 'dashboard', icon: 'home', label: 'Dasbor' },
    { key: 'reservations', icon: 'calendar', label: 'Reservasi' },
    { key: 'reports', icon: 'tool', label: 'Laporan' },
];

export default function Sidebar({ 
    user, 
    auth, 
    csrfToken, 
    urls, 
    active, 
    collapsed = false, 
    onNavigate, 
    onClose, 
    mobile = false, 
    navigation 
}) {
    const currentUser = user || auth?.user;
    const userName = currentUser?.name || 'Pengguna';
    const userEmail = currentUser?.email || '';

    const isAdmin = currentUser?.role === 'admin';
    const isOperator = currentUser?.role === 'operator';
    const navItems = navigation ?? (isAdmin ? adminNavigation : isOperator ? operatorNavigation : userNavigation);

    return (
        <aside className={`app-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
            <div className="app-sidebar-brand">
                <a href={urls?.guest || '#'} className="flex min-w-0 items-center gap-3">
                    <span className="app-brand-mark"><Icon name="campus" className="h-6 w-6" /></span>
                    {!collapsed && (
                        <span className="app-sidebar-label">
                            <span className="block text-lg font-bold tracking-tight">CampuSpace</span>
                            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">Aplikasi</span>
                        </span>
                    )}
                </a>
                {mobile && <button type="button" className="app-sidebar-close" onClick={onClose}><Icon name="close" /></button>}
            </div>

            <nav className="app-sidebar-nav">
                <p className={`app-nav-heading ${collapsed ? 'sr-only' : ''}`}>Menu utama</p>
                {navItems.map(item => {
                    const isActive = active === item.key;
                    return (
                        <Link 
                            key={item.key} 
                            href={urls?.[item.key] || '#'} 
                            onClick={onNavigate} 
                            className={`app-nav-link ${isActive ? 'is-active' : ''}`}
                        >
                            {isActive && (
                                <motion.span 
                                    layoutId={mobile ? 'mobile-app-active' : 'desktop-app-active'} 
                                    className="app-nav-active" 
                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }} 
                                />
                            )}
                            <Icon name={item.icon} className="relative z-10 h-5 w-5 shrink-0" />
                            {!collapsed && <span className="app-sidebar-label relative z-10">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="app-sidebar-footer">
                <Link href={urls?.profile || '#'} onClick={onNavigate} className="app-sidebar-account">
                    <span className="app-avatar shrink-0">{initials(userName)}</span>
                    {!collapsed && (
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-white">{userName}</span>
                            <span className="mt-0.5 block truncate text-xs text-white/50">{userEmail}</span>
                        </span>
                    )}
                </Link>
                <form method="post" action={urls?.logout || '#'}>
                    {csrfToken && <input type="hidden" name="_token" value={csrfToken} />}
                    <button type="submit" className="app-logout">
                        <Icon name="logout" className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Keluar</span>}
                    </button>
                </form>
            </div>
        </aside>
    );
}