import { Link, router } from '@inertiajs/react';
import { motion } from 'motion/react';
import Icon, { initials } from './Icons';
import AmbientParticles from './AmbientParticles';
import { fogImage } from './IntroOverlay';
import botanicalBackground from '../../images/landing-botanical.webp';

const userNavigation = [
    { key: 'dashboard', icon: 'home', label: 'Dasbor' },
    { key: 'catalog', icon: 'room', label: 'Lihat Katalog' },
    { key: 'reservations', icon: 'calendar', label: 'Reservasi Saya' },
    { key: 'reports', icon: 'tool', label: 'Laporan Saya' },
];

const adminNavigation = [
    { key: 'dashboard', icon: 'home', label: 'Dasbor' },
    { key: 'registrations', icon: 'student', label: 'Kelola Akun' },
    { key: 'facilities', icon: 'room', label: 'Kelola Fasilitas' },
    { key: 'recap', icon: 'chart', label: 'Rekap Fasilitas' },
];

const operatorNavigation = [
    { key: 'dashboard', icon: 'home', label: 'Dasbor' },
    { key: 'reservations', icon: 'calendar', label: 'Kelola Reservasi' },
    { key: 'reports', icon: 'tool', label: 'Kelola Laporan' },
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
            <div className="app-sidebar-atmosphere" aria-hidden="true" style={{ backgroundImage: `linear-gradient(160deg, #336358ee, #2f5b51f5 55%, #24483ffb), url('${botanicalBackground}')` }}>
                <div className="app-sidebar-glow app-sidebar-glow-top" />
                <div className="app-sidebar-glow app-sidebar-glow-bottom" />
                <div className="app-sidebar-fog" style={{ backgroundImage: fogImage(7) }} />
                <AmbientParticles compact />
            </div>
            <div className="app-sidebar-brand">
                <a href={urls?.guest || '#'} onClick={onNavigate} aria-label="Buana — Beranda" className="flex min-w-0 items-center gap-3">
                    <span className="app-brand-mark"><Icon name="campus" className="h-6 w-6" /></span>
                    {!collapsed && (
                        <span className="app-sidebar-label">
                            <span className="block text-lg font-bold tracking-tight">Buana</span>
                            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">Aplikasi</span>
                        </span>
                    )}
                </a>
                {mobile && <button type="button" className="app-sidebar-close" aria-label="Tutup menu navigasi" data-drawer-close onClick={onClose}><Icon name="close" /></button>}
            </div>

            <nav className="app-sidebar-nav" aria-label="Menu utama">
                <p className={`app-nav-heading ${collapsed ? 'sr-only' : ''}`}>Menu utama</p>
                {navItems.map(item => {
                    const isActive = active === item.key;
                    return (
                        <Link 
                            key={item.key} 
                            href={urls?.[item.key] || (item.key === 'profile' ? '/profile' : '#')} 
                            onStart={onNavigate}
                            aria-current={isActive ? 'page' : undefined}
                            title={collapsed ? item.label : undefined}
                            aria-label={collapsed ? item.label : undefined}
                            className={`app-nav-link ${isActive ? 'is-active' : ''}`}
                        >
                            {isActive && (
                                <motion.span 
                                    layoutId={mobile ? 'mobile-app-active' : 'desktop-app-active'} 
                                    className="app-nav-active" 
                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }} 
                                />
                            )}
                            <span className="app-nav-icon"><Icon name={item.icon} /></span>
                            {!collapsed && <span className="app-sidebar-label relative z-10">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="app-sidebar-footer">
                <Link href={urls?.profile || '/profile'} onStart={onNavigate} className="app-sidebar-account" aria-label={`Buka profil ${userName}`} title={collapsed ? userName : undefined}>
                    <span className="app-avatar shrink-0">{initials(userName)}</span>
                    {!collapsed && (
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-white">{userName}</span>
                            <span className="mt-0.5 block truncate text-xs text-white/50">{userEmail}</span>
                        </span>
                    )}
                </Link>
                <form method="post" action={urls?.logout || '#'} onSubmit={event => {
                    event.preventDefault();
                    router.post(urls?.logout || '/logout', {}, { preserveState: false });
                }}>
                    {csrfToken && <input type="hidden" name="_token" value={csrfToken} />}
                    <button type="submit" className="app-logout" aria-label={collapsed ? 'Keluar' : undefined} title={collapsed ? 'Keluar' : undefined}>
                        <Icon name="logout" className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Keluar</span>}
                    </button>
                </form>
            </div>
        </aside>
    );
}
